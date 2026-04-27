import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { auth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get all users (for search)
router.get('/', auth, (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT id, username, avatar, status FROM users';
    let params: any[] = [];

    if (search) {
      query += ' WHERE username LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' LIMIT 50';
    const users = db.prepare(query).all(...params);
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to get users' });
  }
});

// Search users
router.get('/search', auth, (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query required' });
    }

    const users = db.prepare(`
      SELECT id, username, avatar, status 
      FROM users 
      WHERE username LIKE ? 
      LIMIT 20
    `).all(`%${q}%`);

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Search failed' });
  }
});

// Get user by ID
router.get('/:id', auth, (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, username, avatar, bio, status, created_at
      FROM users WHERE id = ?
    `).get(req.params.id) as any;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      status: user.status,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to get user' });
  }
});

// Send friend request
router.post('/friend', auth, (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = (req as AuthRequest).user!.id;

    if (friendId === userId) {
      return res.status(400).json({ message: 'Cannot friend yourself' });
    }

    // Check if friend exists
    const friend = db.prepare('SELECT id FROM users WHERE id = ?').get(friendId);
    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already friends
    const existing = db.prepare(`
      SELECT id FROM friends 
      WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)
    `).get(userId, friendId, friendId, userId);

    if (existing) {
      return res.status(400).json({ message: 'Already friends or request pending' });
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO friends (id, user_id, friend_id, status)
      VALUES (?, ?, ?, 'pending')
    `).run(id, userId, friendId);

    res.status(201).json({ message: 'Friend request sent', id });
  } catch (error) {
    console.error('Add friend error:', error);
    res.status(500).json({ message: 'Failed to add friend' });
  }
});

// Respond to friend request
router.put('/friend', auth, (req, res) => {
  try {
    const { friendId, action } = req.body;
    const userId = (req as AuthRequest).user!.id;

    const friendship = db.prepare(`
      SELECT id FROM friends 
      WHERE friend_id = ? AND user_id = ? AND status = 'pending'
    `).get(friendId, userId) as any;

    if (!friendship) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (action === 'accept') {
      db.prepare(`UPDATE friends SET status = 'accepted' WHERE id = ?`).run(friendship.id);
      res.json({ message: 'Friend request accepted' });
    } else if (action === 'reject') {
      db.prepare(`DELETE FROM friends WHERE id = ?`).run(friendship.id);
      res.json({ message: 'Friend request rejected' });
    } else {
      res.status(400).json({ message: 'Invalid action' });
    }
  } catch (error) {
    console.error('Respond to friend error:', error);
    res.status(500).json({ message: 'Failed to respond to friend request' });
  }
});

// Remove friend
router.delete('/friend/:id', auth, (req, res) => {
  try {
    const userId = (req as AuthRequest).user!.id;
    db.prepare(`
      DELETE FROM friends 
      WHERE id = ? AND (user_id = ? OR friend_id = ?)
    `).run(req.params.id, userId, userId);

    res.json({ message: 'Friend removed' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ message: 'Failed to remove friend' });
  }
});

// Get friends list
router.get('/:id/friends', auth, (req, res) => {
  try {
    const friends = db.prepare(`
      SELECT u.id, u.username, u.avatar, u.status
      FROM friends f
      JOIN users u ON (u.id = f.friend_id OR u.id = f.user_id) AND u.id != ?
      WHERE (f.user_id = ? OR f.friend_id = ?) AND f.status = 'accepted'
    `).all(req.params.id, req.params.id, req.params.id);

    res.json(friends);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Failed to get friends' });
  }
});

// Block user
router.post('/block', auth, (req, res) => {
  try {
    const { userId: blockedId } = req.body;
    const userId = (req as AuthRequest).user!.id;

    if (blockedId === userId) {
      return res.status(400).json({ message: 'Cannot block yourself' });
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO blocked_users (id, user_id, blocked_id)
      VALUES (?, ?, ?)
    `).run(id, userId, blockedId);

    res.status(201).json({ message: 'User blocked', id });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ message: 'Failed to block user' });
  }
});

// Unblock user
router.delete('/block/:id', auth, (req, res) => {
  try {
    const userId = (req as AuthRequest).user!.id;
    db.prepare(`DELETE FROM blocked_users WHERE id = ? AND user_id = ?`).run(req.params.id, userId);
    res.json({ message: 'User unblocked' });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ message: 'Failed to unblock user' });
  }
});

// Get DMs
router.get('/dms', auth, (req, res) => {
  try {
    const userId = (req as AuthRequest).user!.id;

    const dms = db.prepare(`
      SELECT 
        dm.id,
        CASE WHEN dm.user1_id = ? THEN dm.user2_id ELSE dm.user1_id END as recipient_id,
        u.username,
        u.avatar,
        u.status,
        (SELECT content FROM messages WHERE channel_id = dm.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT COUNT(*) FROM messages WHERE channel_id = dm.id AND author_id != ? AND created_at > COALESCE((SELECT created_at FROM messages WHERE channel_id = dm.id AND author_id = ? ORDER BY created_at DESC LIMIT 1), '1970-01-01')) as unread
      FROM direct_messages dm
      JOIN users u ON u.id = CASE WHEN dm.user1_id = ? THEN dm.user2_id ELSE dm.user1_id END
      WHERE dm.user1_id = ? OR dm.user2_id = ?
    `).all(userId, userId, userId, userId, userId, userId);

    res.json(dms);
  } catch (error) {
    console.error('Get DMs error:', error);
    res.status(500).json({ message: 'Failed to get DMs' });
  }
});

export default router;