import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { auth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get user's servers
router.get('/', auth, (req, res) => {
  try {
    const userId = (req as AuthRequest).user!.id;

    const servers = db.prepare(`
      SELECT s.id, s.name, s.icon, s.owner_id, s.created_at
      FROM servers s
      JOIN server_members sm ON s.id = sm.server_id
      WHERE sm.user_id = ?
      ORDER BY s.name
    `).all(userId);

    res.json(servers);
  } catch (error) {
    console.error('Get servers error:', error);
    res.status(500).json({ message: 'Failed to get servers' });
  }
});

// Create server
router.post('/', auth, (req, res) => {
  try {
    const { name, icon } = req.body;
    const userId = (req as AuthRequest).user!.id;

    if (!name) {
      return res.status(400).json({ message: 'Server name required' });
    }

    const serverId = uuidv4();
    db.prepare(`
      INSERT INTO servers (id, name, icon, owner_id)
      VALUES (?, ?, ?, ?)
    `).run(serverId, name, icon || null, userId);

    // Add owner as member
    const memberId = uuidv4();
    db.prepare(`
      INSERT INTO server_members (id, server_id, user_id)
      VALUES (?, ?, ?)
    `).run(memberId, serverId, userId);

    // Create default text channel
    const channelId = uuidv4();
    db.prepare(`
      INSERT INTO channels (id, server_id, name, type)
      VALUES (?, ?, 'general', 'text')
    `).run(channelId, serverId);

    const server = {
      id: serverId,
      name,
      icon: icon || null,
      owner_id: userId,
      created_at: new Date().toISOString()
    };

    res.status(201).json(server);
  } catch (error) {
    console.error('Create server error:', error);
    res.status(500).json({ message: 'Failed to create server' });
  }
});

// Get server by ID
router.get('/:id', auth, (req, res) => {
  try {
    const server = db.prepare(`
      SELECT id, name, icon, owner_id, created_at
      FROM servers WHERE id = ?
    `).get(req.params.id) as any;

    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }

    res.json(server);
  } catch (error) {
    console.error('Get server error:', error);
    res.status(500).json({ message: 'Failed to get server' });
  }
});

// Update server
router.put('/:id', auth, (req, res) => {
  try {
    const userId = (req as AuthRequest).user!.id;
    const { name, icon } = req.body;

    // Check ownership
    const server = db.prepare('SELECT owner_id FROM servers WHERE id = ?').get(req.params.id) as any;
    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }

    if (server.owner_id !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }

    if (icon !== undefined) {
      updates.push('icon = ?');
      values.push(icon);
    }

    if (updates.length > 0) {
      values.push(req.params.id);
      db.prepare(`UPDATE servers SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    const updated = db.prepare('SELECT * FROM servers WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Update server error:', error);
    res.status(500).json({ message: 'Failed to update server' });
  }
});

// Delete server
router.delete('/:id', auth, (req, res) => {
  try {
    const userId = (req as AuthRequest).user!.id;

    const server = db.prepare('SELECT owner_id FROM servers WHERE id = ?').get(req.params.id) as any;
    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }

    if (server.owner_id !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    db.prepare('DELETE FROM servers WHERE id = ?').run(req.params.id);
    res.json({ message: 'Server deleted' });
  } catch (error) {
    console.error('Delete server error:', error);
    res.status(500).json({ message: 'Failed to delete server' });
  }
});

// Join server
router.post('/:id/join', auth, (req, res) => {
  try {
    const userId = (req as AuthRequest).user!.id;

    const server = db.prepare('SELECT id FROM servers WHERE id = ?').get(req.params.id);
    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }

    // Check if already member
    const existing = db.prepare('SELECT id FROM server_members WHERE server_id = ? AND user_id = ?').get(req.params.id, userId);
    if (existing) {
      return res.status(400).json({ message: 'Already a member' });
    }

    const memberId = uuidv4();
    db.prepare(`
      INSERT INTO server_members (id, server_id, user_id)
      VALUES (?, ?, ?)
    `).run(memberId, req.params.id, userId);

    res.json({ message: 'Joined server successfully' });
  } catch (error) {
    console.error('Join server error:', error);
    res.status(500).json({ message: 'Failed to join server' });
  }
});

// Leave server
router.post('/:id/leave', auth, (req, res) => {
  try {
    const userId = (req as AuthRequest).user!.id;

    db.prepare('DELETE FROM server_members WHERE server_id = ? AND user_id = ?').run(req.params.id, userId);
    res.json({ message: 'Left server successfully' });
  } catch (error) {
    console.error('Leave server error:', error);
    res.status(500).json({ message: 'Failed to leave server' });
  }
});

// Get server channels
router.get('/:id/channels', auth, (req, res) => {
  try {
    const channels = db.prepare(`
      SELECT id, server_id, name, type, created_at
      FROM channels WHERE server_id = ?
      ORDER BY name
    `).all(req.params.id);

    res.json(channels);
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({ message: 'Failed to get channels' });
  }
});

// Create channel
router.post('/:id/channels', auth, (req, res) => {
  try {
    const userId = (req as AuthRequest).user!.id;
    const { name, type } = req.body;

    const server = db.prepare('SELECT owner_id FROM servers WHERE id = ?').get(req.params.id) as any;
    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }

    if (server.owner_id !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const channelId = uuidv4();
    db.prepare(`
      INSERT INTO channels (id, server_id, name, type)
      VALUES (?, ?, ?, ?)
    `).run(channelId, req.params.id, name, type || 'text');

    const channel = {
      id: channelId,
      server_id: req.params.id,
      name,
      type: type || 'text',
      created_at: new Date().toISOString()
    };

    res.status(201).json(channel);
  } catch (error) {
    console.error('Create channel error:', error);
    res.status(500).json({ message: 'Failed to create channel' });
  }
});

// Get server members
router.get('/:id/members', auth, (req, res) => {
  try {
    const members = db.prepare(`
      SELECT u.id, u.username, u.avatar, u.status, sm.nickname
      FROM server_members sm
      JOIN users u ON sm.user_id = u.id
      WHERE sm.server_id = ?
    `).all(req.params.id);

    res.json(members);
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ message: 'Failed to get members' });
  }
});

// Generate invite
router.get('/:id/invite', auth, (req, res) => {
  try {
    const inviteCode = uuidv4().substring(0, 8);
    // In production, store invite in database with expiry
    res.json({ code: inviteCode, url: `/invite/${inviteCode}` });
  } catch (error) {
    console.error('Generate invite error:', error);
    res.status(500).json({ message: 'Failed to generate invite' });
  }
});

export default router;