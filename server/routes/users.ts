import { Router } from 'express';
import Database from 'better-sqlite3';
import { authMiddleware, AuthenticatedRequest, generateId } from '../auth.js';
import type { Response } from 'express';

export function usersRouter(db: Database.Database) {
  const router = Router();

  // Get user profile
  router.get('/:id', authMiddleware(db), (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id) as any;
      const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(req.params.id) as any;

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        avatarHue: user.avatar_hue,
        profile: profile ? {
          level: profile.level,
          position: profile.position,
          style: profile.style,
          hand: profile.hand,
          formats: JSON.parse(profile.formats),
          days: JSON.parse(profile.days),
          window: profile.window,
          reliability: profile.reliability,
          sportsmanship: profile.sportsmanship,
          rating: profile.rating,
          wins: profile.wins,
          losses: profile.losses,
          streak: profile.streak,
          form: profile.form,
          dna: JSON.parse(profile.dna),
          verified: profile.verified,
          photoVerified: profile.photo_verified,
        } : null,
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  // Update user profile
  router.put('/profile', authMiddleware(db), (req: AuthenticatedRequest, res: Response) => {
    try {
      const { level, position, style, hand, formats, days, window } = req.body;

      db.prepare(`
        UPDATE user_profiles
        SET level = COALESCE(?, level),
            position = COALESCE(?, position),
            style = COALESCE(?, style),
            hand = COALESCE(?, hand),
            formats = COALESCE(?, formats),
            days = COALESCE(?, days),
            window = COALESCE(?, window)
        WHERE user_id = ?
      `).run(
        level,
        position,
        style,
        hand,
        formats ? JSON.stringify(formats) : null,
        days ? JSON.stringify(days) : null,
        window,
        req.user!.id
      );

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Get user's clubs
  router.get('/:id/clubs', authMiddleware(db), (req: AuthenticatedRequest, res: Response) => {
    try {
      const clubs = db.prepare(`
        SELECT c.*, cm.role, cm.joined_at
        FROM clubs c
        JOIN club_memberships cm ON c.id = cm.club_id
        WHERE cm.user_id = ? AND cm.status = 'Active'
      `).all(req.params.id);

      res.json(clubs.map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        hue: c.hue,
        cover: c.cover,
        city: c.city,
        country: c.country,
        courts: c.courts,
        membersCount: c.members_count,
        healthScore: c.health_score,
        role: c.role,
        joinedAt: c.joined_at,
      })));
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch clubs' });
    }
  });

  // Get user's notifications
  router.get('/:id/notifications', authMiddleware(db), (req: AuthenticatedRequest, res: Response) => {
    try {
      const notifications = db.prepare(`
        SELECT * FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 50
      `).all(req.params.id);

      res.json(notifications);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  // Mark notification as read
  router.put('/notifications/:id/read', authMiddleware(db), (req: AuthenticatedRequest, res: Response) => {
    try {
      db.prepare('UPDATE notifications SET unread = 0 WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update notification' });
    }
  });

  return router;
}
