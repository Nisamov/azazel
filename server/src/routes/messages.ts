import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { auth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get channel messages
router.get('/:channelId/messages', auth, (req, res) => {
  try {
    const messages = db.prepare(`
      SELECT m.id, m.channel_id, m.author_id, m.content, m.created_at, m.edited_at,
             u.username, u.avatar
      FROM messages m
      JOIN users u ON m.author_id = u.id
      WHERE m.channel_id = ?
      ORDER BY m.created_at ASC
      LIMIT 100
    `).all(req.params.channelId);

    const formatted = messages.map((m: any) => ({
      id: m.id,
      channelId: m.channel_id,
      authorId: m.author_id,
      content: m.content,
      createdAt: m.created_at,
      editedAt: m.edited_at,
      author: {
        id: m.author_id,
        username: m.username,
        avatar: m.avatar
      }
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Failed to get messages' });
  }
});

// Send message
router.post('/:channelId/messages', auth, (req, res) => {
  try {
    const userId = (req as AuthRequest).user!.id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content required' });
    }

    // Check if user has access to channel
    const channel = db.prepare(`
      SELECT c.id FROM channels c
      LEFT JOIN server_members sm ON c.server_id = sm.server_id AND sm.user_id = ?
      WHERE c.id = ? AND (c.server_id IS NULL OR sm.user_id = ?)
    `).get(userId, req.params.channelId, userId) as any;

    if (!channel) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messageId = uuidv4();
    db.prepare(`
      INSERT INTO messages (id, channel_id, author_id, content)
      VALUES (?, ?, ?, ?)
    `).run(messageId, req.params.channelId, userId, content);

    const user = db.prepare('SELECT username, avatar FROM users WHERE id = ?').get(userId) as any;

    const message = {
      id: messageId,
      channelId: req.params.channelId,
      authorId: userId,
      content,
      createdAt: new Date().toISOString(),
      author: {
        id: userId,
        username: user.username,
        avatar: user.avatar
      }
    };

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Edit message
router.put('/messages/:id', auth, (req, res) => {
  try {
    const userId = (req as AuthRequest).user!.id;
    const { content } = req.body;

    const message = db.prepare('SELECT author_id FROM messages WHERE id = ?').get(req.params.id) as any;
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.author_id !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    db.prepare(`
      UPDATE messages SET content = ?, edited_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(content, req.params.id);

    const updated = db.prepare(`
      SELECT m.*, u.username, u.avatar
      FROM messages m
      JOIN users u ON m.author_id = u.id
      WHERE m.id = ?
    `).get(req.params.id) as any;

    res.json({
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
    });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ message: 'Failed to edit message' });
  }
});

// Delete message
router.delete('/messages/:id', auth, (req, res) => {
  try {
    const userId = (req as AuthRequest).user!.id;

    const message = db.prepare('SELECT author_id FROM messages WHERE id = ?').get(req.params.id) as any;
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.author_id !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    db.prepare('DELETE FROM messages WHERE id = ?').run(req.params.id);
    res.json({ message: 'Message deleted' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Failed to delete message' });
  }
});

export default router;