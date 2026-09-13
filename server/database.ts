import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function initDatabase() {
  const dbPath = path.join(__dirname, '..', 'data', 'rallypoint.db');
  const db = new Database(dbPath);

  // Enable WAL mode for better concurrency
  db.pragma('journal_mode = WAL');

  // Create tables
  db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      date_of_birth TEXT,
      country TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'player',
      avatar_hue INTEGER DEFAULT 84,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- User profiles
    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      level TEXT DEFAULT 'Beginner',
      position TEXT DEFAULT 'Flex',
      style TEXT DEFAULT 'All-round',
      hand TEXT DEFAULT 'Right',
      formats TEXT DEFAULT '["Doubles"]',
      days TEXT DEFAULT '["Mon","Tue","Wed","Thu","Fri"]',
      window TEXT DEFAULT 'Evenings',
      reliability INTEGER DEFAULT 50,
      sportsmanship INTEGER DEFAULT 50,
      rating INTEGER DEFAULT 1000,
      wins INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0,
      form REAL DEFAULT 0,
      dna TEXT DEFAULT '{"aggression":50,"consistency":50,"speed":50,"defense":50,"placement":50,"netPlay":50,"patience":50,"variety":50}',
      verified INTEGER DEFAULT 0,
      photo_verified INTEGER DEFAULT 0
    );

    -- Identity verifications
    CREATE TABLE IF NOT EXISTS identity_verifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      state TEXT NOT NULL DEFAULT 'NOT_STARTED',
      doc_type TEXT,
      doc_name TEXT,
      photo_url TEXT,
      ratio REAL,
      provider_ref TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Clubs
    CREATE TABLE IF NOT EXISTS clubs (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      description TEXT,
      hue INTEGER DEFAULT 84,
      cover TEXT,
      address TEXT,
      city TEXT,
      region TEXT,
      country TEXT,
      courts INTEGER DEFAULT 4,
      indoor INTEGER DEFAULT 1,
      outdoor INTEGER DEFAULT 0,
      surface TEXT DEFAULT 'Cushioned acrylic',
      lit INTEGER DEFAULT 1,
      open_time TEXT DEFAULT '07:00',
      close_time TEXT DEFAULT '22:00',
      days TEXT DEFAULT '["Mon","Tue","Wed","Thu","Fri","Sat"]',
      membership TEXT DEFAULT 'approval',
      levels TEXT DEFAULT '["Beginner","Intermediate"]',
      guests TEXT DEFAULT 'members-only',
      conduct INTEGER DEFAULT 0,
      cancellation TEXT DEFAULT '6h',
      verified INTEGER DEFAULT 0,
      location_verified INTEGER DEFAULT 0,
      health_score INTEGER DEFAULT 75,
      members_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Club memberships
    CREATE TABLE IF NOT EXISTS club_memberships (
      id TEXT PRIMARY KEY,
      club_id TEXT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT DEFAULT 'Member',
      status TEXT DEFAULT 'Active',
      joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(club_id, user_id)
    );

    -- Events
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      club_id TEXT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      filled INTEGER DEFAULT 0,
      level TEXT DEFAULT 'All levels',
      fee REAL DEFAULT 0,
      organizer TEXT,
      waitlist INTEGER DEFAULT 0,
      outdoor INTEGER DEFAULT 0,
      rain_risk INTEGER,
      elimination TEXT DEFAULT 'single',
      pairing TEXT DEFAULT 'blind',
      chat_open INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Event registrations
    CREATE TABLE IF NOT EXISTS event_registrations (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'registered',
      paid INTEGER DEFAULT 0,
      registered_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(event_id, user_id)
    );

    -- Event chats
    CREATE TABLE IF NOT EXISTS event_chats (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      author TEXT NOT NULL,
      player_id TEXT NOT NULL,
      time TEXT NOT NULL,
      text TEXT,
      receipt_file TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Event brackets
    CREATE TABLE IF NOT EXISTS event_brackets (
      id TEXT PRIMARY KEY,
      event_id TEXT UNIQUE NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      pairs TEXT,
      bracket TEXT,
      champion TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Matches
    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      event_id TEXT REFERENCES events(id),
      format TEXT NOT NULL,
      partners TEXT NOT NULL,
      opponents TEXT NOT NULL,
      score TEXT NOT NULL,
      winner TEXT,
      delta INTEGER,
      confirmed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Match players
    CREATE TABLE IF NOT EXISTS match_players (
      match_id TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      team TEXT NOT NULL,
      PRIMARY KEY (match_id, user_id)
    );

    -- Notifications
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      icon TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT,
      time TEXT NOT NULL,
      unread INTEGER DEFAULT 1,
      kind TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Audit logs
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      target TEXT,
      severity TEXT DEFAULT 'info',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
    CREATE INDEX IF NOT EXISTS idx_events_club ON events(club_id);
    CREATE INDEX IF NOT EXISTS idx_club_memberships_user ON club_memberships(user_id);
    CREATE INDEX IF NOT EXISTS idx_event_registrations_user ON event_registrations(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
  `);

  console.log('✅ Database initialized successfully');
  return db;
}
