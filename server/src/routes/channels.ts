import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { auth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Update channel
router.put('/:id', auth, (req, res) => {
  try {
    const userId = (req as AuthRequest).user!.id;
    const { name } = req.body;

    const channel = db.prepare(`
      SELECT c.id, s.owner_id FROM channels c
      JOIN servers s ON c.server_id = s.id
      WHERE c.id = ?
    `).get(req.params.id) as any;

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    if (channel.owner_id !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (name) {
      db.prepare('UPDATE channels SET name = ? WHERE id = ?').run(name, req.params.id);
    }

    const updated = db.prepare('SELECT * FROM channels WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Update channel error:', error);
    res.status(500).json({ message: 'Failed to update channel' });
  }
});

// Delete channel
router.delete('/:id', auth, (req, res) => {
  try {
    const userId = (req as AuthRequest).user!.id;

    const channel = db.prepare(`
      SELECT c.id, s.owner_id FROM channels c
      JOIN servers s ON c.server_id = s.id
      WHERE c.id = ?
    `).get(req.params.id) as any;

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    if (channel.owner_id !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    db.prepare('DELETE FROM channels WHERE id = ?').run(req.params.id);
    res.json({ message: 'Channel deleted' });
  } catch (error) {
    console.error('Delete channel error:', error);
    res.status(500).json({ message: 'Failed to delete channel' });
  }
});

export default router;