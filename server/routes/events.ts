import { Router } from 'express';
import Database from 'better-sqlite3';
import { authMiddleware, AuthenticatedRequest, generateId } from '../auth.js';
import type { Response } from 'express';

export function eventsRouter(db: Database.Database) {
  const router = Router();

  // Get all events (optionally filtered by club)
  router.get('/', (req, res) => {
    try {
      const { clubId } = req.query;
      let query = `
        SELECT e.*, c.name as club_name, c.city, c.country
        FROM events e
        JOIN clubs c ON e.club_id = c.id
      `;
      const params: any[] = [];

      if (clubId) {
        query += ' WHERE e.club_id = ?';
        params.push(clubId);
      }

      query += ' ORDER BY e.created_at DESC';

      const events = db.prepare(query).all(...params);

      res.json(events.map((e: any) => ({
        id: e.id,
        clubId: e.club_id,
        clubName: e.club_name,
        city: e.city,
        country: e.country,
        title: e.title,
        type: e.type,
        date: e.date,
        time: e.time,
        capacity: e.capacity,
        filled: e.filled,
        level: e.level,
        fee: e.fee,
        organizer: e.organizer,
        waitlist: e.waitlist,
        outdoor: e.outdoor,
        rainRisk: e.rain_risk,
        elimination: e.elimination,
        pairing: e.pairing,
        chatOpen: e.chat_open,
        createdAt: e.created_at,
      })));
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  });

  // Get single event with full details
  router.get('/:id', (req, res) => {
    try {
      const event = db.prepare(`
        SELECT e.*, c.name as club_name, c.city, c.country
        FROM events e
        JOIN clubs c ON e.club_id = c.id
        WHERE e.id = ?
      `).get(req.params.id) as any;

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // Get participants
      const participants = db.prepare(`
        SELECT u.id, u.first_name, u.last_name, u.avatar_hue, er.paid
        FROM event_registrations er
        JOIN users u ON er.user_id = u.id
        WHERE er.event_id = ? AND er.status = 'registered'
      `).all(event.id);

      // Get chat messages
      const chat = db.prepare(`
        SELECT * FROM event_chats
        WHERE event_id = ?
        ORDER BY created_at ASC
      `).all(event.id);

      // Get bracket if exists
      const bracket = db.prepare('SELECT * FROM event_brackets WHERE event_id = ?').get(event.id) as any;

      res.json({
        id: event.id,
        clubId: event.club_id,
        clubName: event.club_name,
        city: event.city,
        country: event.country,
        title: event.title,
        type: event.type,
        date: event.date,
        time: event.time,
        capacity: event.capacity,
        filled: event.filled,
        level: event.level,
        fee: event.fee,
        organizer: event.organizer,
        waitlist: event.waitlist,
        outdoor: event.outdoor,
        rainRisk: event.rain_risk,
        elimination: event.elimination,
        pairing: event.pairing,
        chatOpen: event.chat_open,
        participants: participants.map((p: any) => ({
          id: p.id,
          name: `${p.first_name} ${p.last_name}`,
          avatarHue: p.avatar_hue,
          paid: p.paid,
        })),
        chat: chat.map((m: any) => ({
          id: m.id,
          author: m.author,
          playerId: m.player_id,
          time: m.time,
          text: m.text,
          receipt: m.receipt_file ? { fileName: m.receipt_file } : null,
        })),
        bracket: bracket ? {
          pairs: bracket.pairs ? JSON.parse(bracket.pairs) : null,
          bracket: bracket.bracket ? JSON.parse(bracket.bracket) : null,
          champion: bracket.champion,
        } : null,
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch event' });
    }
  });

  // Create event
  router.post('/', authMiddleware(db), (req: AuthenticatedRequest, res: Response) => {
    try {
      const { clubId, title, type, date, time, capacity, level, fee, organizer, outdoor, elimination, pairing } = req.body;

      if (!clubId || !title || !date || !time || !capacity) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const eventId = generateId();
      const isOpenPlay = type === 'Open Play';

      db.prepare(`
        INSERT INTO events (id, club_id, title, type, date, time, capacity, level, fee, organizer, outdoor, elimination, pairing, chat_open)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        eventId,
        clubId,
        title,
        type,
        date,
        time,
        capacity,
        level || 'All levels',
        fee || 0,
        organizer || '',
        outdoor ? 1 : 0,
        elimination || 'single',
        isOpenPlay ? 'blind' : (pairing || 'blind'),
        isOpenPlay ? 1 : 0
      );

      // Create initial system message for Open Play
      if (isOpenPlay) {
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        db.prepare(`
          INSERT INTO event_chats (id, event_id, author, player_id, time, text)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(generateId(), eventId, 'System', 'sys', now, 'Group chat created automatically — only registered players are added.');
      }

      res.status(201).json({ id: eventId, title });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create event' });
    }
  });

  // Register for event
  router.post('/:id/register', authMiddleware(db), (req: AuthenticatedRequest, res: Response) => {
    try {
      const eventId = req.params.id;

      // Get event
      const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId) as any;
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // Check if already registered
      const existing = db.prepare('SELECT id FROM event_registrations WHERE event_id = ? AND user_id = ?').get(eventId, req.user!.id);
      if (existing) {
        return res.status(409).json({ error: 'Already registered for this event' });
      }

      // Check capacity
      if (event.filled >= event.capacity) {
        return res.status(400).json({ error: 'Event is full' });
      }

      // Register
      const regId = generateId();
      db.prepare(`
        INSERT INTO event_registrations (id, event_id, user_id, status)
        VALUES (?, ?, ?, ?)
      `).run(regId, eventId, req.user!.id, 'registered');

      // Update filled count
      db.prepare('UPDATE events SET filled = filled + 1 WHERE id = ?').run(eventId);

      // Add to chat if Open Play
      if (event.type === 'Open Play' && event.chat_open) {
        const user = db.prepare('SELECT first_name, last_name FROM users WHERE id = ?').get(req.user!.id) as any;
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        db.prepare(`
          INSERT INTO event_chats (id, event_id, author, player_id, time, text)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(generateId(), eventId, `${user.first_name} ${user.last_name}`, req.user!.id, now, 'Joined from the player app — slot confirmed.');
      }

      res.status(201).json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to register for event' });
    }
  });

  // Send chat message
  router.post('/:id/chat', authMiddleware(db), (req: AuthenticatedRequest, res: Response) => {
    try {
      const eventId = req.params.id;
      const { text, receipt } = req.body;

      // Verify user is registered
      const reg = db.prepare('SELECT id FROM event_registrations WHERE event_id = ? AND user_id = ?').get(eventId, req.user!.id);
      if (!reg) {
        return res.status(403).json({ error: 'Not registered for this event' });
      }

      const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId) as any;
      if (!event.chat_open) {
        return res.status(400).json({ error: 'Chat is closed' });
      }

      const user = db.prepare('SELECT first_name, last_name FROM users WHERE id = ?').get(req.user!.id) as any;
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const msgId = generateId();

      db.prepare(`
        INSERT INTO event_chats (id, event_id, author, player_id, time, text, receipt_file)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(msgId, eventId, `${user.first_name} ${user.last_name}`, req.user!.id, now, text || null, receipt?.fileName || null);

      res.status(201).json({ id: msgId });
    } catch (err) {
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // Mark player as paid (organizer only)
  router.post('/:id/paid/:userId', authMiddleware(db), (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id: eventId, userId } = req.params;

      // Verify registration exists
      const reg = db.prepare('SELECT id FROM event_registrations WHERE event_id = ? AND user_id = ?').get(eventId, userId);
      if (!reg) {
        return res.status(404).json({ error: 'Player not registered for this event' });
      }

      // Mark as paid
      db.prepare('UPDATE event_registrations SET paid = 1 WHERE event_id = ? AND user_id = ?').run(eventId, userId);

      // Add system message
      const user = db.prepare('SELECT first_name, last_name FROM users WHERE id = ?').get(userId) as any;
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      db.prepare(`
        INSERT INTO event_chats (id, event_id, author, player_id, time, text)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(generateId(), eventId, 'System', 'sys', now, `${user.first_name} ${user.last_name} verified as Paid — moved to the shuffle pool.`);

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to mark as paid' });
    }
  });

  // Generate bracket
  router.post('/:id/bracket', authMiddleware(db), (req: AuthenticatedRequest, res: Response) => {
    try {
      const eventId = req.params.id;
      const { pairs, bracket, champion } = req.body;

      const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId) as any;
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // Upsert bracket
      const existing = db.prepare('SELECT id FROM event_brackets WHERE event_id = ?').get(eventId);
      if (existing) {
        db.prepare(`
          UPDATE event_brackets
          SET pairs = ?, bracket = ?, champion = ?, updated_at = CURRENT_TIMESTAMP
          WHERE event_id = ?
        `).run(JSON.stringify(pairs), JSON.stringify(bracket), champion || null, eventId);
      } else {
        db.prepare(`
          INSERT INTO event_brackets (id, event_id, pairs, bracket, champion)
          VALUES (?, ?, ?, ?, ?)
        `).run(generateId(), eventId, JSON.stringify(pairs), JSON.stringify(bracket), champion || null);
      }

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to save bracket' });
    }
  });

  // Close chat
  router.post('/:id/close-chat', authMiddleware(db), (req: AuthenticatedRequest, res: Response) => {
    try {
      const eventId = req.params.id;

      db.prepare('UPDATE events SET chat_open = 0 WHERE id = ?').run(eventId);

      // Add system message
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      db.prepare(`
        INSERT INTO event_chats (id, event_id, author, player_id, time, text)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(generateId(), eventId, 'System', 'sys', now, 'The organizer closed this group chat. It is no longer available to players.');

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to close chat' });
    }
  });

  return router;
}
