import { Router } from 'express';
import Database from 'better-sqlite3';
import { authMiddleware, AuthenticatedRequest, generateId } from '../auth.js';
import type { Response } from 'express';

export function matchesRouter(db: Database.Database) {
  const router = Router();

  // Get user's match history
  router.get('/history/:userId', authMiddleware(db), (req: AuthenticatedRequest, res: Response) => {
    try {
      const matches = db.prepare(`
        SELECT m.*, mp.team
        FROM matches m
        JOIN match_players mp ON m.id = mp.match_id
        WHERE mp.user_id = ?
        ORDER BY m.created_at DESC
        LIMIT 50
      `).all(req.params.userId);

      res.json(matches.map((m: any) => ({
        id: m.id,
        eventId: m.event_id,
        format: m.format,
        partners: m.partners,
        opponents: m.opponents,
        score: m.score,
        winner: m.winner,
        delta: m.delta,
        confirmed: m.confirmed,
        team: m.team,
        createdAt: m.created_at,
      })));
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch match history' });
    }
  });

  // Record match result
  router.post('/', authMiddleware(db), (req: AuthenticatedRequest, res: Response) => {
    try {
      const { eventId, format, partners, opponents, score, winner, delta } = req.body;

      if (!format || !partners || !opponents || !score) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const matchId = generateId();

      db.prepare(`
        INSERT INTO matches (id, event_id, format, partners, opponents, score, winner, delta)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(matchId, eventId || null, format, partners, opponents, score, winner || null, delta || 0);

      // Add match players
      const playerIds = [req.user!.id]; // Add more as needed
      playerIds.forEach((pid) => {
        db.prepare(`
          INSERT INTO match_players (match_id, user_id, team)
          VALUES (?, ?, ?)
        `).run(matchId, pid, 'A');
      });

      // Update user stats if winner/loser
      if (winner && delta) {
        const isWinner = winner === req.user!.id;
        db.prepare(`
          UPDATE user_profiles
          SET rating = rating + ?,
              wins = wins + ?,
              losses = losses + ?
          WHERE user_id = ?
        `).run(delta, isWinner ? 1 : 0, isWinner ? 0 : 1, req.user!.id);
      }

      res.status(201).json({ id: matchId });
    } catch (err) {
      res.status(500).json({ error: 'Failed to record match' });
    }
  });

  return router;
}
