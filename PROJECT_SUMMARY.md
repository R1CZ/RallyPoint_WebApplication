# RallyPoint - Full Stack Web Application

## 🎯 Project Overview

RallyPoint is a complete, production-ready web application for pickleball clubs, players, and organizers. It's now a **full-stack application** with:

- ✅ **Frontend**: React + TypeScript + Vite + Tailwind CSS
- ✅ **Backend**: Node.js + Express + TypeScript
- ✅ **Database**: SQLite (production-ready, easily migratable to PostgreSQL)
- ✅ **Authentication**: JWT-based with real email/SMS verification
- ✅ **API**: RESTful endpoints for all features
- ✅ **Real-time features**: Event chat, payments, brackets, tournaments

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd rallypoint

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# The .env file is already configured with development defaults

# 4. Start the application (frontend + backend)
npm run dev
```

The application will start:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 📁 Project Structure

```
rallypoint/
├── server/                    # Backend (Express + TypeScript)
│   ├── index.ts              # Server entry point
│   ├── database.ts           # SQLite database setup
│   ├── auth.ts               # Authentication utilities
│   ├── routes/               # API routes
│   │   ├── auth.ts          # Authentication endpoints
│   │   ├── users.ts         # User management
│   │   ├── clubs.ts         # Club management
│   │   ├── events.ts        # Event management + tournaments
│   │   ├── matches.ts       # Match recording
│   │   └── verification.ts  # Identity verification
│   └── data/                 # SQLite database (auto-created)
│
├── src/                       # Frontend (React + TypeScript)
│   ├── components/           # Reusable UI components
│   ├── pages/                # Page components
│   │   ├── Landing.tsx      # Marketing page
│   │   ├── Onboarding.tsx   # Registration flow
│   │   ├── PlayerApp.tsx    # Player dashboard
│   │   ├── ClubWizard.tsx   # Club creation
│   │   └── ClubAdmin.tsx    # Club management
│   ├── lib/                  # Utilities and logic
│   │   ├── engine.ts        # Core algorithms
│   │   ├── data.ts          # Seed data
│   │   ├── api.ts           # API client
│   │   └── liveDelivery.ts  # Email/SMS delivery
│   └── App.tsx              # Main app component
│
├── .env                       # Environment variables
├── docker-compose.yml         # Docker setup
├── Dockerfile.backend         # Backend container
├── Dockerfile.frontend        # Frontend container
├── API.md                     # API documentation
├── DEPLOYMENT.md              # Deployment guide
└── README.md                  # This file
```

## 🎮 Features

### For Players
- ✅ Create and verify account (email + phone)
- ✅ Build player profile with skill level, DNA, availability
- ✅ Discover clubs with smart matching
- ✅ Join clubs and events
- ✅ Play Now feature - find games instantly
- ✅ Track match history and ratings
- ✅ Earn achievements and badges
- ✅ Real-time event chat
- ✅ Payment receipt submission
- ✅ Notifications system

### For Club Owners
- ✅ Create and manage clubs
- ✅ Configure courts and facilities
- ✅ Manage members with RBAC
- ✅ Create events (Open Play, Tournaments, Training)
- ✅ Tournament management:
  - Single/Double elimination
  - Blind pairing or By Pair
  - Automatic bracket generation
  - Payment verification
  - Group chat for participants
- ✅ Health score and analytics
- ✅ Court utilization insights
- ✅ Member retention tracking

### Security & Trust
- ✅ JWT authentication
- ✅ Real email verification (EmailJS)
- ✅ Real SMS verification (Twilio)
- ✅ Identity verification pipeline
- ✅ Rate limiting
- ✅ Input validation (Zod)
- ✅ SQL injection protection
- ✅ CORS protection
- ✅ Audit logging

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/verify-email` - Verify email code
- `POST /api/v1/auth/verify-phone` - Verify phone code
- `GET /api/v1/auth/me` - Get current user

### Users
- `GET /api/v1/users/:id` - Get user profile
- `PUT /api/v1/users/profile` - Update profile
- `GET /api/v1/users/:id/clubs` - Get user's clubs
- `GET /api/v1/users/:id/notifications` - Get notifications

### Clubs
- `GET /api/v1/clubs` - List all clubs
- `GET /api/v1/clubs/:id` - Get club details
- `POST /api/v1/clubs` - Create club
- `POST /api/v1/clubs/:id/join` - Join club
- `GET /api/v1/clubs/:id/members` - Get members

### Events
- `GET /api/v1/events` - List events
- `GET /api/v1/events/:id` - Get event details
- `POST /api/v1/events` - Create event
- `POST /api/v1/events/:id/register` - Register for event
- `POST /api/v1/events/:id/chat` - Send chat message
- `POST /api/v1/events/:id/paid/:userId` - Mark player as paid
- `POST /api/v1/events/:id/bracket` - Save bracket
- `POST /api/v1/events/:id/close-chat` - Close event chat

### Matches
- `GET /api/v1/matches/history/:userId` - Get match history
- `POST /api/v1/matches` - Record match

### Verification
- `POST /api/v1/verification/start` - Start verification
- `POST /api/v1/verification/complete` - Complete verification
- `GET /api/v1/verification/status` - Get verification status

**Full API documentation**: See [API.md](./API.md)

## 🗄️ Database Schema

The application uses SQLite with the following tables:

- `users` - User accounts
- `user_profiles` - Player profiles and stats
- `identity_verifications` - KYC verification records
- `clubs` - Club information
- `club_memberships` - Club membership records
- `events` - Event details
- `event_registrations` - Event signups
- `event_chats` - Event chat messages
- `event_brackets` - Tournament brackets
- `matches` - Match records
- `match_players` - Match participants
- `notifications` - User notifications
- `audit_logs` - Security audit trail

Database file: `server/data/rallypoint.db` (auto-created on first run)

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or run separately
docker build -t rallypoint-backend -f Dockerfile.backend .
docker build -t rallypoint-frontend -f Dockerfile.frontend .
```

## 🌐 Production Deployment

### Option 1: Vercel + Railway (Recommended)
- **Frontend**: Deploy to Vercel
- **Backend**: Deploy to Railway
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions

### Option 2: Traditional VPS
- Deploy backend with PM2
- Serve frontend with nginx
- Use PostgreSQL instead of SQLite for production scale

### Option 3: Docker
- Use provided Dockerfiles
- Deploy to any container platform

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start frontend + backend
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start backend only

# Production
npm run build            # Build frontend
npm run typecheck        # Type check

# Database
# SQLite database auto-created at server/data/rallypoint.db
```

### Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `VITE_API_URL` - Backend API URL
- `JWT_SECRET` - JWT signing secret
- `VITE_EMAILJS_*` - EmailJS configuration
- `VITE_TWILIO_*` - Twilio SMS configuration

## 🧪 Testing

The application includes comprehensive validation:

- **Frontend validation**: Real-time form validation
- **Backend validation**: Zod schemas for all endpoints
- **Security**: Rate limiting, CORS, input sanitization
- **Authentication**: JWT tokens with expiration

## 📊 Performance

- Frontend: Optimized React with code splitting
- Backend: Express with rate limiting
- Database: SQLite with indexed queries
- Ready to scale to PostgreSQL + Redis

## 🔐 Security Features

- JWT authentication with secure token storage
- Password hashing with bcrypt
- Rate limiting on all endpoints
- Input validation and sanitization
- SQL injection protection
- CORS protection
- Audit logging for all actions
- Secure file upload handling

## 📱 Mobile Ready

The frontend is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile phones

## 🎨 UI/UX

- Modern, professional design
- Tailwind CSS for styling
- Custom design system
- Accessible components
- Smooth animations
- Dark theme optimized

## 🔄 Real-time Features

- Event chat (WebSocket-ready)
- Live notifications
- Real-time bracket updates
- Instant payment verification

## 📈 Analytics & Insights

- Club health score
- Court utilization metrics
- Player performance tracking
- Match statistics
- Achievement system

## 🎯 Smart Features

- **Fair Match Engine**: Balanced matchmaking based on skill, form, and style
- **Play Style DNA**: 8-dimension player behavior profile
- **Game Gap Finder**: Find games that need players
- **Skill Balance Radar**: Visual skill distribution
- **Community Health Score**: Club performance metrics
- **Court Utilization Intelligence**: Optimize court usage
- **Smart Waitlist**: Auto-fill when players cancel

## 📚 Documentation

- [README.md](./README.md) - Project overview
- [API.md](./API.md) - Complete API documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture (coming soon)

## 🤝 Contributing

This is a production-ready application. To customize:

1. Update environment variables in `.env`
2. Modify seed data in `src/lib/data.ts`
3. Customize UI in `src/components/`
4. Extend API in `server/routes/`
5. Add features following existing patterns

## 📝 License

This is a demonstration project. All rights reserved.

## 🙏 Credits

Built by **Jonric Manisan**

## 📞 Support

For questions or issues:
1. Check the documentation
2. Review API.md for endpoint details
3. Check DEPLOYMENT.md for setup issues
4. Review code comments for implementation details

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: 2024
