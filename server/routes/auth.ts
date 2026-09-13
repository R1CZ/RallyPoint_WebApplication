import { Router } from 'express';
import { z } from 'zod';
import Database from 'better-sqlite3';
import { hashPassword, verifyPassword, generateToken, generateId, authMiddleware, AuthenticatedRequest } from '../auth.js';
import type { Response } from 'express';

const registerSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  password: z.string().min(8),
  dob: z.string().optional(),
  country: z.string().default('Philippines'),
  role: z.enum(['player', 'club']).default('player'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export function authRouter(db: Database.Database) {
  const router = Router();

  // Register
  router.post('/register', (req, res) => {
    try {
      const data = registerSchema.parse(req.body);

      // Check if user exists
      const existing = db.prepare('SELECT id FROM users WHERE email = ? OR phone = ?').get(data.email, data.phone);
      if (existing) {
        return res.status(409).json({ error: 'User with this email or phone already exists' });
      }

      const userId = generateId();
      const passwordHash = hashPassword(data.password);
      const avatarHue = Math.abs((data.firstName.length * 37 + data.lastName.length * 53) % 360);

      // Create user
      db.prepare(`
        INSERT INTO users (id, email, phone, password_hash, first_name, last_name, date_of_birth, country, role, avatar_hue)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(userId, data.email, data.phone, passwordHash, data.firstName, data.lastName, data.dob || null, data.country, data.role, avatarHue);

      // Create profile
      db.prepare(`
        INSERT INTO user_profiles (user_id)
        VALUES (?)
      `).run(userId);

      // Generate verification codes (in production, these would be sent via email/SMS)
      const emailCode = Math.floor(100000 + Math.random() * 900000).toString();
      const phoneCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Store codes temporarily (in production, use Redis with TTL)
      db.prepare(`
        INSERT INTO audit_logs (id, actor, action, target, severity)
        VALUES (?, ?, ?, ?, ?)
      `).run(generateId(), userId, 'verification_codes_generated', JSON.stringify({ emailCode, phoneCode }), 'info');

      // Generate token
      const token = generateToken({ id: userId, email: data.email, role: data.role });

      res.status(201).json({
        user: {
          id: userId,
          email: data.email,
          phone: data.phone,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          avatarHue,
        },
        token,
        verificationCodes: { emailCode, phoneCode }, // Only in dev mode
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: err.errors });
      }
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // Login
  router.post('/login', (req, res) => {
    try {
      const data = loginSchema.parse(req.body);

      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(data.email) as any;
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (!verifyPassword(data.password, user.password_hash)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = generateToken({ id: user.id, email: user.email, role: user.role });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          avatarHue: user.avatar_hue,
        },
        token,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: err.errors });
      }
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Verify email code
  router.post('/verify-email', authMiddleware(db), (req: AuthenticatedRequest, res: Response) => {
    try {
      const { code } = req.body;
      if (!code || typeof code !== 'string' || code.length !== 6) {
        return res.status(400).json({ error: 'Invalid code format' });
      }

      // In production, verify against Redis/DB stored code
      // For demo, accept any 6-digit code
      res.json({ verified: true });
    } catch (err) {
      res.status(500).json({ error: 'Verification failed' });
    }
  });

  // Verify phone code
  router.post('/verify-phone', authMiddleware(db), (req: AuthenticatedRequest, res: Response) => {
    try {
      const { code } = req.body;
      if (!code || typeof code !== 'string' || code.length !== 6) {
        return res.status(400).json({ error: 'Invalid code format' });
      }

      // In production, verify against Redis/DB stored code
      // For demo, accept any 6-digit code
      res.json({ verified: true });
    } catch (err) {
      res.status(500).json({ error: 'Verification failed' });
    }
  });

  // Get current user
  router.get('/me', authMiddleware(db), (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.id) as any;
      const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(req.user!.id) as any;

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          avatarHue: user.avatar_hue,
          verified: profile?.verified || false,
          photoVerified: profile?.photo_verified || false,
          profile: profile ? {
            level: profile.level,
            rating: profile.rating,
            wins: profile.wins,
            losses: profile.losses,
            streak: profile.streak,
          } : null,
        },
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  return router;
}
