import { Router } from 'express';
import Database from 'better-sqlite3';
import { authMiddleware, AuthenticatedRequest, generateId } from '../auth.js';
import type { Response } from 'express';

export function clubsRouter(db: Database.Database) {
  const router = Router();

  // Get all clubs
  router.get('/', (req, res) => {
    try {
      const clubs = db.prepare(`
        SELECT c.*, u.first_name, u.last_name
        FROM clubs c
        JOIN users u ON c.owner_id = u.id
        ORDER BY c.created_at DESC
      `).all();

      res.json(clubs.map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        hue: c.hue,
        cover: c.cover,
        address: c.address,
        city: c.city,
        region: c.region,
        country: c.country,
        courts: c.courts,
        indoor: c.indoor,
        outdoor: c.outdoor,
        surface: c.surface,
        lit: c.lit,
        openTime: c.open_time,
        closeTime: c.close_time,
        days: JSON.parse(c.days),
        membership: c.membership,
        levels: JSON.parse(c.levels),
        guests: c.guests,
        cancellation: c.cancellation,
        verified: c.verified,
        locationVerified: c.location_verified,
        healthScore: c.health_score,
        membersCount: c.members_count,
        ownerName: `${c.first_name} ${c.last_name}`,
      })));
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch clubs' });
    }
  });

  // Get single club
  router.get('/:id', (req, res) => {
    try {
      const club = db.prepare(`
        SELECT c.*, u.first_name, u.last_name, u.email
        FROM clubs c
        JOIN users u ON c.owner_id = u.id
        WHERE c.id = ?
      `).get(req.params.id) as any;

      if (!club) {
        return res.status(404).json({ error: 'Club not found' });
      }

      res.json({
        id: club.id,
        name: club.name,
        description: club.description,
        hue: club.hue,
        cover: club.cover,
        address: club.address,
        city: club.city,
        region: club.region,
        country: club.country,
        courts: club.courts,
        indoor: club.indoor,
        outdoor: club.outdoor,
        surface: club.surface,
        lit: club.lit,
        openTime: club.open_time,
        closeTime: club.close_time,
        days: JSON.parse(club.days),
        membership: club.membership,
        levels: JSON.parse(club.levels),
        guests: club.guests,
        cancellation: club.cancellation,
        verified: club.verified,
        locationVerified: club.location_verified,
        healthScore: club.health_score,
        membersCount: club.members_count,
        owner: {
          id: club.owner_id,
          name: `${club.first_name} ${club.last_name}`,
          email: club.email,
        },
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch club' });
    }
  });

  // Create club
  router.post('/', authMiddleware(db), (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, description, hue, cover, address, city, region, country, courts, indoor, outdoor, surface, lit, openTime, closeTime, days, membership, levels, guests, cancellation } = req.body;

      if (!name || !city || !country) {
        return res.status(400).json({ error: 'Name, city, and country are required' });
      }

      const clubId = generateId();

      db.prepare(`
        INSERT INTO clubs (id, owner_id, name, description, hue, cover, address, city, region, country, courts, indoor, outdoor, surface, lit, open_time, close_time, days, membership, levels, guests, cancellation)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        clubId,
        req.user!.id,
        name,
        description || '',
        hue || 84,
        cover || '',
        address || '',
        city,
        region || '',
        country,
        courts || 4,
        indoor ? 1 : 0,
        outdoor ? 1 : 0,
        surface || 'Cushioned acrylic',
        lit ? 1 : 0,
        openTime || '07:00',
        closeTime || '22:00',
        JSON.stringify(days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']),
        membership || 'approval',
        JSON.stringify(levels || ['Beginner', 'Intermediate']),
        guests || 'members-only',
        cancellation || '6h'
      );

      // Add owner as member
      db.prepare(`
        INSERT INTO club_memberships (id, club_id, user_id, role, status)
        VALUES (?, ?, ?, ?, ?)
      `).run(generateId(), clubId, req.user!.id, 'Owner', 'Active');

      res.status(201).json({ id: clubId, name });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create club' });
    }
  });

  // Join club
  router.post('/:id/join', authMiddleware(db), (req: AuthenticatedRequest, res: Response) => {
    try {
      const clubId = req.params.id;

      // Check if already a member
      const existing = db.prepare('SELECT id FROM club_memberships WHERE club_id = ? AND user_id = ?').get(clubId, req.user!.id);
      if (existing) {
        return res.status(409).json({ error: 'Already a member of this club' });
      }

      const membershipId = generateId();
      db.prepare(`
        INSERT INTO club_memberships (id, club_id, user_id, role, status)
        VALUES (?, ?, ?, ?, ?)
      `).run(membershipId, clubId, req.user!.id, 'Member', 'Active');

      // Update member count
      db.prepare('UPDATE clubs SET members_count = members_count + 1 WHERE id = ?').run(clubId);

      res.status(201).json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to join club' });
    }
  });

  // Get club members
  router.get('/:id/members', authMiddleware(db), (req: AuthenticatedRequest, res: Response) => {
    try {
      const members = db.prepare(`
        SELECT u.id, u.first_name, u.last_name, u.avatar_hue, cm.role, cm.status, cm.joined_at
        FROM club_memberships cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.club_id = ?
        ORDER BY cm.joined_at DESC
      `).all(req.params.id);

      res.json(members.map((m: any) => ({
        id: m.id,
        name: `${m.first_name} ${m.last_name}`,
        avatarHue: m.avatar_hue,
        role: m.role,
        status: m.status,
        joinedAt: m.joined_at,
      })));
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch members' });
    }
  });

  return router;
}
