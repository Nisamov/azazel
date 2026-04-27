import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import db from '../db/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'hikarune-secret-key-change-in-production';

// Track connected users
const connectedUsers = new Map<string, string>(); // socketId -> userId

export function initSocket(io: Server) {
  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; username: string; email: string };
      (socket as any).user = decoded;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`User connected: ${user.username} (${socket.id})`);

    // Track connected user
    connectedUsers.set(socket.id, user.id);

    // Update user status to online
    try {
      db.prepare('UPDATE users SET status = ? WHERE id = ?').run('online', user.id);
    } catch (e) {
      console.error('Failed to update status:', e);
    }

    // Notify others that user is online
    io.emit('user_online', { userId: user.id });

    // Join channel
    socket.on('join_channel', (data: { channelId: string }) => {
      socket.join(data.channelId);
      console.log(`User ${user.username} joined channel ${data.channelId}`);
    });

    // Leave channel
    socket.on('leave_channel', (data: { channelId: string }) => {
      socket.leave(data.channelId);
      console.log(`User ${user.username} left channel ${data.channelId}`);
    });

    // Send message
    socket.on('send_message', (data: { channelId: string; content: string }) => {
      try {
        // Store message in database
        const { v4: uuidv4 } = require('uuid');
        const messageId = uuidv4();

        db.prepare(`
          INSERT INTO messages (id, channel_id, author_id, content)
          VALUES (?, ?, ?, ?)
        `).run(messageId, data.channelId, user.id, data.content);

        // Get user info
        const userInfo = db.prepare('SELECT username, avatar FROM users WHERE id = ?').get(user.id) as any;

        const message = {
          id: messageId,
          channelId: data.channelId,
          authorId: user.id,
          content: data.content,
          createdAt: new Date().toISOString(),
          author: {
            id: user.id,
            username: userInfo.username,
            avatar: userInfo.avatar
          }
        };

        // Broadcast to channel
        io.to(data.channelId).emit('new_message', message);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Edit message
    socket.on('edit_message', (data: { messageId: string; content: string }) => {
      try {
        const message = db.prepare('SELECT author_id, channel_id FROM messages WHERE id = ?').get(data.messageId) as any;
        
        if (!message || message.author_id !== user.id) {
          return socket.emit('error', { message: 'Not authorized' });
        }

        db.prepare(`
          UPDATE messages SET content = ?, edited_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(data.content, data.messageId);

        const updated = db.prepare(`
          SELECT m.*, u.username, u.avatar
          FROM messages m
          JOIN users u ON m.author_id = u.id
          WHERE m.id = ?
        `).get(data.messageId) as any;

        const messageData = {
          id: updated.id,
          channelId: updated.channel_id,
          authorId: updated.author_id,
          content: updated.content,
          createdAt: updated.created_at,
          editedAt: updated.edited_at,
          author: {
            id: updated.author_id,
            username: updated.username,
            avatar: updated.avatar
          }
        };

        io.to(message.channel_id).emit('message_updated', messageData);
      } catch (error) {
        console.error('Edit message error:', error);
      }
    });

    // Delete message
    socket.on('delete_message', (data: { messageId: string }) => {
      try {
        const message = db.prepare('SELECT author_id, channel_id FROM messages WHERE id = ?').get(data.messageId) as any;
        
        if (!message || message.author_id !== user.id) {
          return socket.emit('error', { message: 'Not authorized' });
        }

        db.prepare('DELETE FROM messages WHERE id = ?').run(data.messageId);

        io.to(message.channel_id).emit('message_deleted', {
          messageId: data.messageId,
          channelId: message.channel_id
        });
      } catch (error) {
        console.error('Delete message error:', error);
      }
    });

    // Typing indicators
    socket.on('typing_start', (data: { channelId: string }) => {
      socket.to(data.channelId).emit('typing', {
        userId: user.id,
        channelId: data.channelId,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data: { channelId: string }) => {
      socket.to(data.channelId).emit('typing', {
        userId: user.id,
        channelId: data.channelId,
        isTyping: false
      });
    });

    // Update presence
    socket.on('update_presence', (data: { status: string }) => {
      try {
        db.prepare('UPDATE users SET status = ? WHERE id = ?').run(data.status, user.id);
        io.emit('presence_update', { userId: user.id, status: data.status });
      } catch (error) {
        console.error('Update presence error:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${user.username}`);
      connectedUsers.delete(socket.id);

      // Update user status to offline
      try {
        db.prepare('UPDATE users SET status = ? WHERE id = ?').run('offline', user.id);
        io.emit('user_offline', { userId: user.id });
      } catch (e) {
        console.error('Failed to update offline status:', e);
      }
    });
  });
}