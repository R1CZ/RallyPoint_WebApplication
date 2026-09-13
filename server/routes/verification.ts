import { Router } from 'express';
import Database from 'better-sqlite3';
import { authMiddleware, AuthenticatedRequest, generateId } from '../auth.js';
import type { Response } from 'express';

export function verificationRouter(db: Database.Database) {
  const router = Router();

  // Start verification
  router.post('/start', authMiddleware(db), (req: AuthenticatedRequest, res: Response) => {
    try {
      const { docType, docName } = req.body;

      const verificationId = generateId();

      db.prepare(`
        INSERT INTO identity_verifications (id, user_id, state, doc_type, doc_name)
        VALUES (?, ?, ?, ?, ?)
      `).run(verificationId, req.user!.id, 'IN_PROGRESS', docType || 'Passport', docName || '');

      // Log audit
      db.prepare(`
        INSERT INTO audit_logs (id, actor, action, target, severity)
        VALUES (?, ?, ?, ?, ?)
      `).run(generateId(), req.user!.id, 'verification_started', verificationId, 'info');

      res.status(201).json({ id: verificationId, state: 'IN_PROGRESS' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to start verification' });
    }
  });

  // Complete verification (simulated)
  router.post('/complete', authMiddleware(db), (req: AuthenticatedRequest, res: Response) => {
    try {
      const { ratio } = req.body;

      // Get latest verification
      const verification = db.prepare(`
        SELECT * FROM identity_verifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 1
      `).get(req.user!.id) as any;

      if (!verification) {
        return res.status(404).json({ error: 'No verification in progress' });
      }

      // Determine state based on ratio
      let state = 'VERIFIED';
      if (ratio < 0.72) state = 'REJECTED';
      else if (ratio < 0.86) state = 'NEEDS_REVIEW';

      db.prepare(`
        UPDATE identity_verifications
        SET state = ?, ratio = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(state, ratio, verification.id);

      // Update user profile if verified
      if (state === 'VERIFIED') {
        db.prepare('UPDATE user_profiles SET verified = 1 WHERE user_id = ?').run(req.user!.id);
      }

      // Log audit
      db.prepare(`
        INSERT INTO audit_logs (id, actor, action, target, severity)
        VALUES (?, ?, ?, ?, ?)
      `).run(generateId(), req.user!.id, 'verification_completed', JSON.stringify({ state, ratio }), state === 'REJECTED' ? 'warn' : 'info');

      res.json({ state, ratio });
    } catch (err) {
      res.status(500).json({ error: 'Failed to complete verification' });
    }
  });

  // Get verification status
  router.get('/status', authMiddleware(db), (req: AuthenticatedRequest, res: Response) => {
    try {
      const verification = db.prepare(`
        SELECT * FROM identity_verifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 1
      `).get(req.user!.id) as any;

      if (!verification) {
        return res.json({ state: 'NOT_STARTED' });
      }

      res.json({
        id: verification.id,
        state: verification.state,
        docType: verification.doc_type,
        docName: verification.doc_name,
        ratio: verification.ratio,
        createdAt: verification.created_at,
        updatedAt: verification.updated_at,
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch verification status' });
    }
  });

  return router;
}
