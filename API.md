# RallyPoint API Documentation

Base URL: `http://localhost:3001/api/v1`

All authenticated endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

## Authentication

### Register
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+639171234567",
  "password": "securepassword123",
  "dob": "1990-01-15",
  "country": "Philippines",
  "role": "player"
}
```

**Response:**
```json
{
  "user": {
    "id": "1234567890-abc123",
    "email": "john@example.com",
    "phone": "+639171234567",
    "firstName": "John",
    "lastName": "Doe",
    "role": "player",
    "avatarHue": 84
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "verificationCodes": {
    "emailCode": "424242",
    "phoneCode": "424242"
  }
}
```

### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "1234567890-abc123",
    "email": "john@example.com",
    "phone": "+639171234567",
    "firstName": "John",
    "lastName": "Doe",
    "role": "player",
    "avatarHue": 84
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Verify Email
**POST** `/auth/verify-email` 🔒

**Request Body:**
```json
{
  "code": "424242"
}
```

**Response:**
```json
{
  "verified": true
}
```

### Verify Phone
**POST** `/auth/verify-phone` 🔒

**Request Body:**
```json
{
  "code": "424242"
}
```

**Response:**
```json
{
  "verified": true
}
```

### Get Current User
**GET** `/auth/me` 🔒

**Response:**
```json
{
  "user": {
    "id": "1234567890-abc123",
    "email": "john@example.com",
    "phone": "+639171234567",
    "firstName": "John",
    "lastName": "Doe",
    "role": "player",
    "avatarHue": 84,
    "verified": false,
    "photoVerified": false,
    "profile": {
      "level": "Beginner",
      "rating": 1000,
      "wins": 0,
      "losses": 0,
      "streak": 0
    }
  }
}
```

## Users

### Get User Profile
**GET** `/users/:id` 🔒

**Response:**
```json
{
  "id": "1234567890-abc123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "player",
  "avatarHue": 84,
  "profile": {
    "level": "Intermediate",
    "position": "Right stack",
    "style": "Control dinker",
    "hand": "Right",
    "formats": ["Doubles", "Mixed"],
    "days": ["Tue", "Thu", "Sat"],
    "window": "Evenings",
    "reliability": 96,
    "sportsmanship": 92,
    "rating": 1428,
    "wins": 21,
    "losses": 13,
    "streak": 4,
    "form": 0.35,
    "dna": {
      "aggression": 42,
      "consistency": 78,
      "speed": 58,
      "defense": 70,
      "placement": 82,
      "netPlay": 74,
      "patience": 80,
      "variety": 64
    },
    "verified": true,
    "photoVerified": true
  }
}
```

### Update Profile
**PUT** `/users/profile` 🔒

**Request Body:**
```json
{
  "level": "Intermediate",
  "position": "Right stack",
  "style": "Control dinker",
  "hand": "Right",
  "formats": ["Doubles", "Mixed"],
  "days": ["Tue", "Thu", "Sat"],
  "window": "Evenings"
}
```

**Response:**
```json
{
  "success": true
}
```

### Get User's Clubs
**GET** `/users/:id/clubs` 🔒

**Response:**
```json
[
  {
    "id": "club-123",
    "name": "Downtown Pickleball Club",
    "description": "The city's busiest indoor facility",
    "hue": 84,
    "cover": "https://...",
    "city": "Riverside District",
    "country": "Philippines",
    "courts": 8,
    "membersCount": 342,
    "healthScore": 87,
    "role": "Member",
    "joinedAt": "2024-01-15T10:00:00Z"
  }
]
```

### Get User's Notifications
**GET** `/users/:id/notifications` 🔒

**Response:**
```json
[
  {
    "id": "notif-123",
    "icon": "calendar",
    "title": "Waitlist slot opened",
    "body": "Thursday Night Doubles Ladder — a spot just opened.",
    "time": "2m ago",
    "unread": 1,
    "kind": "waitlist",
    "createdAt": "2024-06-12T14:00:00Z"
  }
]
```

### Mark Notification as Read
**PUT** `/users/notifications/:id/read` 🔒

**Response:**
```json
{
  "success": true
}
```

## Clubs

### Get All Clubs
**GET** `/clubs`

**Response:**
```json
[
  {
    "id": "club-123",
    "name": "Downtown Pickleball Club",
    "description": "The city's busiest indoor facility",
    "hue": 84,
    "cover": "https://...",
    "address": "88 Kitchen Line Ave",
    "city": "Riverside District",
    "region": "Metro Manila",
    "country": "Philippines",
    "courts": 8,
    "indoor": 1,
    "outdoor": 0,
    "surface": "Cushioned acrylic",
    "lit": 1,
    "openTime": "07:00",
    "closeTime": "22:00",
    "days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    "membership": "approval",
    "levels": ["Beginner", "Intermediate", "Advanced"],
    "guests": "members-only",
    "cancellation": "6h",
    "verified": true,
    "locationVerified": true,
    "healthScore": 87,
    "membersCount": 342,
    "ownerName": "Jordan Blake"
  }
]
```

### Get Single Club
**GET** `/clubs/:id`

**Response:**
```json
{
  "id": "club-123",
  "name": "Downtown Pickleball Club",
  "description": "The city's busiest indoor facility",
  "hue": 84,
  "cover": "https://...",
  "address": "88 Kitchen Line Ave",
  "city": "Riverside District",
  "region": "Metro Manila",
  "country": "Philippines",
  "courts": 8,
  "indoor": 1,
  "outdoor": 0,
  "surface": "Cushioned acrylic",
  "lit": 1,
  "openTime": "07:00",
  "closeTime": "22:00",
  "days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  "membership": "approval",
  "levels": ["Beginner", "Intermediate", "Advanced"],
  "guests": "members-only",
  "cancellation": "6h",
  "verified": true,
  "locationVerified": true,
  "healthScore": 87,
  "membersCount": 342,
  "owner": {
    "id": "user-456",
    "name": "Jordan Blake",
    "email": "jordan@example.com"
  }
}
```

### Create Club
**POST** `/clubs` 🔒

**Request Body:**
```json
{
  "name": "Riverside Rally Club",
  "description": "A friendly community for pickleball enthusiasts",
  "hue": 120,
  "cover": "https://...",
  "address": "123 Court Street",
  "city": "Riverside District",
  "region": "Metro Manila",
  "country": "Philippines",
  "courts": 6,
  "indoor": true,
  "outdoor": false,
  "surface": "Cushioned acrylic",
  "lit": true,
  "openTime": "08:00",
  "closeTime": "21:00",
  "days": ["Mon", "Tue", "Wed", "Thu", "Fri"],
  "membership": "approval",
  "levels": ["Beginner", "Intermediate"],
  "guests": "members-only",
  "cancellation": "6h"
}
```

**Response:**
```json
{
  "id": "club-789",
  "name": "Riverside Rally Club"
}
```

### Join Club
**POST** `/clubs/:id/join` 🔒

**Response:**
```json
{
  "success": true
}
```

### Get Club Members
**GET** `/clubs/:id/members` 🔒

**Response:**
```json
[
  {
    "id": "user-456",
    "name": "Jordan Blake",
    "avatarHue": 200,
    "role": "Owner",
    "status": "Active",
    "joinedAt": "2024-01-01T10:00:00Z"
  }
]
```

## Events

### Get All Events
**GET** `/events`

**Query Parameters:**
- `clubId` (optional): Filter by club

**Response:**
```json
[
  {
    "id": "event-123",
    "clubId": "club-123",
    "clubName": "Downtown Pickleball Club",
    "city": "Riverside District",
    "country": "Philippines",
    "title": "Thursday Night Doubles Ladder",
    "type": "League",
    "date": "2024-06-13",
    "time": "19:00 – 21:00",
    "capacity": 24,
    "filled": 24,
    "level": "Intermediate+",
    "fee": 8,
    "organizer": "Coach Dana",
    "waitlist": 6,
    "outdoor": 0,
    "rainRisk": null,
    "elimination": "single",
    "pairing": "blind",
    "chatOpen": 0,
    "createdAt": "2024-06-10T10:00:00Z"
  }
]
```

### Get Single Event
**GET** `/events/:id`

**Response:**
```json
{
  "id": "event-123",
  "clubId": "club-123",
  "clubName": "Downtown Pickleball Club",
  "city": "Riverside District",
  "country": "Philippines",
  "title": "Friday Night Open Play",
  "type": "Open Play",
  "date": "2024-06-20",
  "time": "19:00 – 21:00",
  "capacity": 8,
  "filled": 5,
  "level": "Intermediate",
  "fee": 5,
  "organizer": "Downtown PC",
  "waitlist": 0,
  "outdoor": 0,
  "rainRisk": null,
  "elimination": "single",
  "pairing": "blind",
  "chatOpen": 1,
  "participants": [
    {
      "id": "user-456",
      "name": "Diego Ramos",
      "avatarHue": 160,
      "paid": true
    }
  ],
  "chat": [
    {
      "id": "msg-123",
      "author": "System",
      "playerId": "sys",
      "time": "09:00",
      "text": "Group chat created automatically — only registered players are added.",
      "receipt": null
    }
  ],
  "bracket": {
    "pairs": [["user-456", "user-789"]],
    "bracket": [...],
    "champion": null
  }
}
```

### Create Event
**POST** `/events` 🔒

**Request Body:**
```json
{
  "clubId": "club-123",
  "title": "Friday Night Open Play",
  "type": "Open Play",
  "date": "2024-06-20",
  "time": "19:00 – 21:00",
  "capacity": 8,
  "level": "Intermediate",
  "fee": 5,
  "organizer": "Downtown PC",
  "outdoor": false,
  "elimination": "single",
  "pairing": "blind"
}
```

**Response:**
```json
{
  "id": "event-789",
  "title": "Friday Night Open Play"
}
```

### Register for Event
**POST** `/events/:id/register` 🔒

**Response:**
```json
{
  "success": true
}
```

### Send Chat Message
**POST** `/events/:id/chat` 🔒

**Request Body:**
```json
{
  "text": "See you all Friday!",
  "receipt": {
    "fileName": "gcash-receipt-8841.png"
  }
}
```

**Response:**
```json
{
  "id": "msg-789"
}
```

### Mark Player as Paid
**POST** `/events/:id/paid/:userId` 🔒

**Response:**
```json
{
  "success": true
}
```

### Save Bracket
**POST** `/events/:id/bracket` 🔒

**Request Body:**
```json
{
  "pairs": [["user-456", "user-789"], ["user-123", "user-999"]],
  "bracket": [...],
  "champion": "user-456"
}
```

**Response:**
```json
{
  "success": true
}
```

### Close Chat
**POST** `/events/:id/close-chat` 🔒

**Response:**
```json
{
  "success": true
}
```

## Matches

### Get Match History
**GET** `/matches/history/:userId` 🔒

**Response:**
```json
[
  {
    "id": "match-123",
    "eventId": "event-456",
    "format": "Doubles",
    "partners": "You + Maya Chen",
    "opponents": "Park / Okafor",
    "score": "11–7",
    "winner": "user-789",
    "delta": 14,
    "confirmed": 1,
    "team": "A",
    "createdAt": "2024-06-10T19:00:00Z"
  }
]
```

### Record Match
**POST** `/matches` 🔒

**Request Body:**
```json
{
  "eventId": "event-456",
  "format": "Doubles",
  "partners": "You + Maya Chen",
  "opponents": "Park / Okafor",
  "score": "11–7",
  "winner": "user-789",
  "delta": 14
}
```

**Response:**
```json
{
  "id": "match-789"
}
```

## Verification

### Start Verification
**POST** `/verification/start` 🔒

**Request Body:**
```json
{
  "docType": "Passport",
  "docName": "John Michael Doe"
}
```

**Response:**
```json
{
  "id": "verify-123",
  "state": "IN_PROGRESS"
}
```

### Complete Verification
**POST** `/verification/complete` 🔒

**Request Body:**
```json
{
  "ratio": 0.92
}
```

**Response:**
```json
{
  "state": "VERIFIED",
  "ratio": 0.92
}
```

### Get Verification Status
**GET** `/verification/status` 🔒

**Response:**
```json
{
  "id": "verify-123",
  "state": "VERIFIED",
  "docType": "Passport",
  "docName": "John Michael Doe",
  "ratio": 0.92,
  "createdAt": "2024-06-12T14:00:00Z",
  "updatedAt": "2024-06-12T14:05:00Z"
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "details": [...] // Optional validation errors
}
```

**Common HTTP Status Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

## Rate Limiting

- General API: 100 requests per 15 minutes per IP
- Auth endpoints: 5 requests per 15 minutes per IP

Rate limit exceeded response:
```json
{
  "error": "Too many requests, please try again later."
}
```

## Notes

- 🔒 indicates authentication required
- All timestamps are in ISO 8601 format (UTC)
- IDs are generated as `{timestamp}-{random-string}`
- Phone numbers should be in international format (e.g., `+639171234567`)
- Dates are in `YYYY-MM-DD` format
- Times are in `HH:MM` format (24-hour)
