# RallyPoint - Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Application
```bash
npm run dev
```

This starts both frontend and backend:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

### 3. Open Your Browser
Navigate to **http://localhost:5173**

That's it! You're ready to use RallyPoint.

---

## 📝 First Time Setup

### Create Your Account
1. Click "Get Started" on the landing page
2. Choose your role: **Player** or **Club Owner**
3. Fill in your details:
   - First name (e.g., "John")
   - Last name (e.g., "Doe")
   - Email (e.g., "john@example.com")
   - Phone (Philippine format: +639171234567)
   - Password (min 8 characters)
   - Country (default: Philippines)
4. Verify your email and phone with the codes shown
5. Complete identity verification (optional for demo)

### As a Player
1. **Build your profile**: Set your skill level, preferred positions, availability
2. **Discover clubs**: Browse nearby clubs with smart matching
3. **Join a club**: Click "Join" on any club
4. **Find games**: Use "Play Now" to find instant games
5. **Register for events**: Sign up for tournaments and open play
6. **Track progress**: View your match history, ratings, and achievements

### As a Club Owner
1. **Create your club**: Fill in club details, location, courts
2. **Configure settings**: Set operating hours, membership rules
3. **Create events**: 
   - Open Play (auto group chat + blind pairing)
   - Tournaments (single/double elimination)
   - Training sessions
4. **Manage members**: Approve/reject join requests
5. **Run tournaments**:
   - Collect payments via chat
   - Verify receipts
   - Shuffle players
   - Generate brackets
   - Track results

---

## 🎮 Key Features to Try

### For Players
- **Play Now**: Click the lightning bolt to find instant games
- **Club Discovery**: See clubs ranked by compatibility
- **Event Chat**: Join event-specific group chats
- **Payment Receipts**: Upload receipts in event chat
- **Achievements**: Earn badges for milestones

### For Club Owners
- **Create Open Play Event**:
  1. Go to Events → Create Event
  2. Select "Open Play"
  3. Set elimination to "Single Elim"
  4. Pairing auto-sets to "Blind Pairing"
  5. Group chat auto-creates
  
- **Run a Tournament**:
  1. Create event as "Tournament"
  2. Choose Single or Double Elimination
  3. Choose Blind Pairing or By Pair
  4. Players register and pay
  5. Verify payments in chat
  6. Shuffle paid players
  7. Generate bracket
  8. Record match results

---

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill the process
kill -9 <PID>

# Restart
npm run dev
```

### Frontend can't connect to backend
1. Verify backend is running: http://localhost:3001/health
2. Check `.env` file has `VITE_API_URL=http://localhost:3001/api/v1`
3. Restart both services: `npm run dev`

### Database errors
```bash
# Delete database and restart
rm server/data/rallypoint.db
npm run dev
```

### Can't register
- Make sure backend is running
- Check browser console for errors
- Verify email/phone format is correct
- Try different email/phone (must be unique)

---

## 📚 Learn More

- **Full Documentation**: [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
- **API Reference**: [API.md](./API.md)
- **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Architecture**: [README.md](./README.md)

---

## 💡 Tips

1. **Demo Mode**: The app works without EmailJS/Twilio configured - verification codes are shown on screen
2. **Multiple Accounts**: Create different accounts to test player/owner interactions
3. **Tournaments**: Try creating a tournament with 4+ players to see bracket generation
4. **Chat**: Use the event chat to simulate real player interactions
5. **Analytics**: Check club health scores and court utilization insights

---

## 🎯 Next Steps

1. ✅ Create your account
2. ✅ Explore the dashboard
3. ✅ Join or create a club
4. ✅ Register for an event
5. ✅ Try the Play Now feature
6. ✅ Check out the admin panel

---

**Need Help?**
- Check the documentation files
- Review the code comments
- Inspect browser/network console for errors

**Happy Playing! 🏓**
