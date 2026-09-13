# RallyPoint Deployment Guide

## Quick Start (Development)

```bash
# 1. Clone and install
git clone <repo-url>
cd rallypoint
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your settings (or use defaults for local dev)

# 3. Start both frontend and backend
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:3001

## Production Deployment

### Option 1: Vercel + Railway (Recommended)

**Frontend (Vercel):**
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables:
   - `VITE_API_URL=https://your-backend.railway.app/api/v1`
   - `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`
4. Deploy

**Backend (Railway):**
1. Create new project on Railway
2. Connect GitHub repo
3. Set start command: `npm run dev:backend`
4. Set environment variables:
   - `NODE_ENV=production`
   - `JWT_SECRET=<generate-strong-secret>`
   - `CORS_ORIGIN=https://your-frontend.vercel.app`
5. Deploy

### Option 2: Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build separately
docker build -t rallypoint-backend -f Dockerfile.backend .
docker build -t rallypoint-frontend -f Dockerfile.frontend .
```

### Option 3: Traditional VPS

**Backend:**
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone <repo-url>
cd rallypoint
npm install --production
cp .env.example .env
# Edit .env with production values

# Run with PM2
npm install -g pm2
pm2 start "npm run dev:backend" --name rallypoint-api
pm2 save
pm2 startup
```

**Frontend:**
```bash
npm run build
# Serve dist/ with nginx or any static file server
```

## Environment Variables

### Required for Production

```bash
# Backend
NODE_ENV=production
PORT=3001
JWT_SECRET=<strong-random-secret>
CORS_ORIGIN=https://your-domain.com

# Frontend
VITE_API_URL=https://api.your-domain.com/api/v1
VITE_EMAILJS_SERVICE_ID=<from-emailjs>
VITE_EMAILJS_TEMPLATE_ID=<from-emailjs>
VITE_EMAILJS_PUBLIC_KEY=<from-emailjs>
```

### Optional (for additional features)

```bash
# Twilio (SMS verification)
VITE_TWILIO_ACCOUNT_SID=<from-twilio>
VITE_TWILIO_AUTH_TOKEN=<from-twilio>
VITE_TWILIO_PHONE_NUMBER=+1234567890

# Maps
MAP_PROVIDER=google|mapbox|osm
MAP_API_KEY=<your-key>

# Weather
WEATHER_API_KEY=<your-key>

# Payments
PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=<your-key>
```

## Database

SQLite database is auto-created at `server/data/rallypoint.db` on first run.

**Backup:**
```bash
# Create backup
cp server/data/rallypoint.db server/data/rallypoint.backup.$(date +%Y%m%d).db

# Restore
cp server/data/rallypoint.backup.YYYYMMDD.db server/data/rallypoint.db
```

**Migration to PostgreSQL (future):**
The backend is designed to be database-agnostic. To migrate:
1. Install `pg` package
2. Update `server/database.ts` to use PostgreSQL
3. Update connection string in `.env`
4. Run schema migrations

## Security Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Set `NODE_ENV=production`
- [ ] Configure `CORS_ORIGIN` to your frontend domain
- [ ] Enable HTTPS (Vercel/Railway do this automatically)
- [ ] Set up EmailJS for real email delivery
- [ ] Configure Twilio for SMS verification
- [ ] Set up proper file upload storage (S3, etc.)
- [ ] Enable database backups
- [ ] Set up monitoring/logging
- [ ] Configure rate limiting appropriately

## Monitoring

**Logs:**
```bash
# Backend logs (PM2)
pm2 logs rallypoint-api

# Backend logs (Docker)
docker logs rallypoint-backend

# Frontend logs (Vercel)
# View in Vercel dashboard
```

**Health Check:**
```bash
curl http://localhost:3001/health
# Returns: {"status":"ok","timestamp":"..."}
```

## Scaling

**Current architecture:**
- SQLite: Single file, good for < 1000 concurrent users
- Express: Single process, can handle ~1000 req/s

**To scale:**
1. Replace SQLite with PostgreSQL (supports millions of rows)
2. Add Redis for caching and sessions
3. Use load balancer (nginx, AWS ALB)
4. Run multiple backend instances
5. Use CDN for static assets (Vercel does this automatically)

## Troubleshooting

**Backend won't start:**
- Check if port 3001 is in use: `lsof -i :3001`
- Check Node.js version: `node --version` (need 18+)
- Check `.env` file exists and has required variables

**Frontend can't connect to backend:**
- Verify backend is running: `curl http://localhost:3001/health`
- Check `VITE_API_URL` in `.env`
- Check CORS settings in backend

**Database errors:**
- Delete `server/data/rallypoint.db` and restart (will recreate)
- Check file permissions on `server/data/` directory

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the API documentation in README.md
3. Check backend logs for error details
4. Verify environment variables are set correctly
