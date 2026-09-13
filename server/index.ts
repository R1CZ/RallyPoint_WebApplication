import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { initDatabase } from './database.js';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { clubsRouter } from './routes/clubs.js';
import { eventsRouter } from './routes/events.js';
import { matchesRouter } from './routes/matches.js';
import { verificationRouter } from './routes/verification.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  message: { error: 'Too many authentication attempts, please try again later.' }
});
app.use('/api/v1/auth/', authLimiter);

// Initialize database
const db = initDatabase();

// Routes
app.use('/api/v1/auth', authRouter(db));
app.use('/api/v1/users', usersRouter(db));
app.use('/api/v1/clubs', clubsRouter(db));
app.use('/api/v1/events', eventsRouter(db));
app.use('/api/v1/matches', matchesRouter(db));
app.use('/api/v1/verification', verificationRouter(db));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`🚀 RallyPoint API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
