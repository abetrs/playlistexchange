# The Playlist Exchange: instructions.md

This file will guide our collaboration in building "The Playlist Exchange" application. It outlines the project's goals, architecture, and the step-by-step plan we'll follow. Please use the context provided here to assist in code generation, problem-solving, and architectural decisions for our **Node.js (Express)** and **Svelte** stack.

---

## 🚀 Project Overview

**Idea:** The Playlist Exchange ("Itch") is an application that connects users with similar music tastes, allowing them to exchange playlists through a session-based system. The app uses Spotify and Last.fm APIs to analyze user taste profiles and facilitate music discovery exchanges.

**Tech Stack:** 
- **Backend:** Node.js/Express with Firebase/Firestore database
- **Frontend:** Svelte 5 with Vite (no external routing library - custom implementation)
- **APIs:** Spotify API, Last.fm API  
- **Database:** Firebase Firestore (production), In-memory (development)
- **Authentication:** Passport.js with OAuth2 flows

---

### � MVP Features (Current Implementation Status)

✅ **Completed:**
1. **Basic Project Structure:** Full-stack setup with modular backend architecture
2. **Session Management:** Create sessions with group names/sizes, join with codes, Firestore integration
3. **Frontend Navigation:** Custom routing system with Home, Create, and Join pages
4. **UI Components:** Complete component library with responsive design
5. **Last.fm Integration:** Basic service setup for fetching user top artists
6. **Session API Endpoints:** Complete CRUD operations for sessions and participants
7. **Authentication Routes:** Last.fm OAuth authentication flow with Firestore user storage

🔄 **In Progress:**
8. **Music Service Authentication:** OAuth flows for Spotify/Last.fm (Last.fm completed, Spotify pending)
9. **User Profile Management:** Database models for participants and music profiles (Last.fm users implemented)

⏳ **Planned:**
8. **Taste Profile Analysis:** Process API data to create compatibility profiles
9. **User Matching Algorithm:** Compare profiles to generate compatibility scores
10. **Real-time Updates:** WebSocket support for live session updates
11. **Results Display:** UI for showing matched participants and recommendations

---

## 🎯 Current Implementation: Session-Based Music Exchange

### Architecture Overview

**Backend Structure (Express.js):**

```text
backend/
├── src/
│   ├── index.js                 # Main server setup
│   ├── database.js              # In-memory database (development)
│   ├── firebase.js              # Firestore configuration  
│   ├── controllers/             # Request handlers
│   │   ├── health.controller.js
│   │   ├── session.controller.js
│   │   ├── lastfm.controller.js
│   │   └── auth.controller.js   # Last.fm OAuth authentication
│   ├── routes/                  # API endpoints
│   │   ├── health.route.js
│   │   ├── session.route.js
│   │   ├── lastfm.route.js
│   │   └── auth.route.js        # Authentication routes
│   └── services/                # External API integration
│       └── lastfm.service.js
├── package.json
├── .env                         # Environment variables
└── serviceAccountKey.json       # Firebase credentials
```

**Frontend Structure (Svelte 5):**

```text
frontend/
├── src/
│   ├── main.js                  # Application entry point
│   ├── app.css                  # Global styles and fonts
│   ├── App.svelte               # Root component with routing
│   ├── routes/                  # Page components
│   │   ├── Home.svelte          # Landing page
│   │   ├── Create.svelte        # Session creation
│   │   └── Join.svelte          # Session joining
│   ├── lib/                     # Reusable components
│   │   ├── BrandContainer.svelte
│   │   ├── ActionsMenu.svelte
│   │   ├── CreateSection.svelte
│   │   ├── JoinSection.svelte
│   │   └── Counter.svelte       # Example component
│   └── assets/                  # Static resources
├── index.html
├── package.json
└── vite.config.js
```

### Implemented Features

**Current API Endpoints:**

- `GET /health` - Server health check
- `POST /session` - Create new session with group name/size
- `GET /session/:code` - Retrieve session information
- `GET /session/:code/participants` - Get list of participants in a session
- `POST /session/:code/join` - Add user to session
- `GET /lastfm/top-artists/:user` - Fetch Last.fm user top artists
- `GET /auth/lastfm` - Initiate Last.fm OAuth authentication
- `GET /auth/lastfm/callback` - Handle Last.fm OAuth callback

**Frontend Navigation Flow:**

1. **Home Page** (`Home.svelte`) - Entry point with join/create options
2. **Create Page** (`Create.svelte`) - Set up new music exchange sessions  
3. **Join Page** (`Join.svelte`) - Join existing sessions with music service connection

**Key UI Components:**

- `BrandContainer.svelte` - Displays "Itch" brand title (Instrument Serif font)
- `ActionsMenu.svelte` - Home page join/create interface
- `CreateSection.svelte` & `JoinSection.svelte` - Specialized form components

**Current Color Scheme:**

- Primary background: `#ffff60` (bright yellow)
- Component backgrounds: `#e8e8d0` (warm beige)
- Borders: `#000` (black, 2-3px solid)
- Interactive elements: `#f5f5f5` with hover states

### Last.fm Authentication System

**Implementation Status:** ✅ **Completed**

The Last.fm OAuth authentication flow has been fully implemented with Firestore integration:

**Authentication Flow:**

1. **Initiate Authentication:** `GET /auth/lastfm`
   - Returns JSON with Last.fm authorization URL
   - Frontend handles the redirect to Last.fm
   - Uses `LASTFM_API_KEY` from environment variables

2. **Handle Callback:** `GET /auth/lastfm/callback`
   - Processes token from Last.fm callback
   - Exchanges token for session key using signed API request
   - Saves user data to Firestore `users` collection
   - Returns JSON response with success/error status

**User Data Storage (Firestore `users` collection):**

```javascript
{
  lastfmUsername: "user123",          // Document ID
  sessionKey: "abc123...",            // For API authentication
  realName: "John Doe",               // User's real name
  url: "https://last.fm/user/user123", // Profile URL
  country: "United States",           // User location
  age: "25",                          // User age
  gender: "m",                        // User gender
  subscriber: "0",                    // Subscription status
  playcount: "5000",                  // Total track plays
  playlists: "10",                    // Number of playlists
  registered: {                       // Registration details
    unixtime: "1234567890",
    text: "2009-02-13 15:31"
  },
  createdAt: Timestamp,               // First auth
  updatedAt: Timestamp                // Last auth
}
```

**API Response Examples:**

**Auth Initiation Response:**
```json
{
  "message": "Last.fm authentication URL generated",
  "authUrl": "http://www.last.fm/api/auth/?api_key=YOUR_API_KEY",
  "success": true
}
```

**Auth Callback Success:**
```json
{
  "message": "Successfully authenticated with Last.fm",
  "success": true,
  "user": {
    "lastfmUsername": "user123",
    "realName": "John Doe",
    "url": "https://last.fm/user/user123",
    "country": "United States",
    "playcount": "5000"
  }
}
```

**Auth Callback Error:**
```json
{
  "message": "Failed to authenticate with Last.fm",
  "success": false,
  "error": "session_error",
  "details": {...}
}
```

### Session Management Pattern

**Create Flow:** User enters group name and selects group size (1-20 people), backend generates unique session codes using UUID

**Join Flow:** User enters join code, provides name, connects music service, gets added to session participant list

**Database Models (Firestore):**

```javascript
// Session Document
{
  code: "ABC123",           // 6-character uppercase UUID
  name: "My Music Group",   // User-provided group name
  maxSize: 5,              // Selected group size (1-20)
  participants: [          // Array of participant objects
    {
      name: "John Doe",
      // Music profile data will be added here
    }
  ],
  createdAt: Timestamp,    // Creation date
  status: "waiting"        // Session status
}
```

### Music Service Integration

**Current Backend:** Last.fm API integration (`lastfm.service.js`), Express server with modular routes

**Environment Variables (.env):**

```bash
LASTFM_API_KEY=your_api_key
LASTFM_API_SECRET=your_api_secret
SESSION_SECRET=your_session_secret
GOOGLE_APPLICATION_CREDENTIALS="./serviceAccountKey.json"
```

**Frontend Connection Pattern:**

```javascript
function connectLastfm() {
  console.log("Connecting to Last.fm with name:", userName);
  // Redirects to backend auth flow (to be implemented)
}

function connectSpotify() {
  console.log("Connecting to Spotify with name:", userName);
  // Redirects to backend auth flow (to be implemented)
}
```

### Development Patterns to Follow

**Component Structure:**

- Use `BrandContainer` for consistent branding across pages
- Include "By ReallyAbe" attribution in top-right corner
- Implement responsive design with specific breakpoints (768px, 480px)
- Use consistent button styling with hover effects and transforms

**Styling Conventions:**

- Font sizes in `pt` units (20pt base, 18pt mobile, 16pt small mobile)
- Border radius: 8px for inputs/buttons, 15-20px for containers
- Padding: 1rem base, scale up for containers (2-3rem)
- Box shadows: `0 4px 10px rgba(0, 0, 0, 0.1)` for depth

**Navigation Implementation:**

```javascript
// Custom routing system in App.svelte
function navigate(path) {
  window.history.pushState({}, "", path);
  updatePath();
}

// Make available globally for components
window.navigate = navigate;

// Usage in components
function goBack() {
  window.navigate("/");
}

function navigateToJoin(code) {
  window.navigate(`/join/${code}`);
}
```

### Required Backend Enhancements

**Remaining Session Management APIs:**

- `DELETE /session/:code` - Delete session
- `PUT /session/:code` - Update session details

**Authentication Flow Implementation Needed:**

- Spotify OAuth2 integration with Passport.js
- Complete Last.fm authentication flow
- Link authenticated users to sessions
- Store music profiles in Firestore

**Dependencies Already Installed:**

```json
{
  "express": "^5.1.0",
  "express-session": "^1.18.1", 
  "passport": "^0.7.0",
  "firebase-admin": "^13.4.0",
  "axios": "^1.10.0",
  "dotenv": "^17.0.1",
  "uuid": "^11.1.0"
}
```

### Next Development Steps

1. **Complete Music Service Authentication:**
   - Implement Spotify OAuth2 flow with Passport.js
   - Complete Last.fm authentication integration
   - Connect frontend music service buttons to backend auth

2. **Enhanced Data Models:**
   - Add music profile fields to participant objects
   - Implement profile fetching and storage
   - Add user preference and matching criteria

3. **Matching Algorithm Implementation:**
   - Compare taste profiles using modern JavaScript features
   - Generate compatibility scores for session participants
   - Store and retrieve matching results

4. **Real-time Features:**
   - WebSocket integration for live session updates
   - Real-time participant list updates
   - Session status broadcasting

5. **Results and Recommendations UI:**
   - Display matched participants in sessions
   - Show compatibility scores and recommendations
   - Implement playlist exchange interface

---

## 📝 Best Practices & Development Standards

### Code Standards

- **JavaScript:** Airbnb Style Guide with ESLint/Prettier
- **Error Handling:** Centralized Express middleware, try/catch blocks
- **Modularity:** Separate routes/controllers/services, reusable Svelte components
- **Environment:** Use `.env` file with `dotenv` for sensitive data
- **Version Control:** Use .gitignore for node_modules, .env, and service account keys

### Design System

**Typography:**

- **Primary Font:** 'Instrument Serif', serif (used for all UI elements)
- **Brand Title:** 'Instrument Serif', serif (`BrandContainer.svelte`)
- **Attribution:** Helvetica, Arial, sans-serif ("By ReallyAbe")

**Color Palette:**

- **Background:** `#ffff60` (bright yellow)
- **Components:** `#e8e8d0` (warm beige)
- **Borders:** `#000` (black, 2-3px solid)
- **Interactive:** `#f5f5f5` with hover states

**Layout & Spacing:**

- **Font Sizes:** 20pt base (18pt mobile, 16pt small mobile)
- **Border Radius:** 8px for inputs/buttons, 15-20px for containers
- **Padding:** 1rem base, scale up for containers (2-3rem)
- **Shadows:** `0 4px 10px rgba(0, 0, 0, 0.1)` for depth

**Responsive Breakpoints:**

- **Tablet:** 768px (adjust font sizes and layout)
- **Mobile:** 480px (stack elements, hide decorative elements)

### Important Implementation Notes

**Svelte 5 Features Used:**

- `$state()` for reactive variables (modern Svelte 5 syntax)
- `mount()` instead of `new App()` for initialization
- Custom routing without external libraries

**Font Management:**

Components with scoped styles may override global fonts. Explicitly set `font-family: 'Instrument Serif', serif` in component styles when needed. Note: The instructions mention 'Micro 5' font but the actual implementation uses 'Instrument Serif'.

**Navigation Pattern:**

```javascript
// Global navigation function attached to window
window.navigate = navigate;

// Usage in any component
function handleAction() {
  window.navigate("/target-path");
}
```

**Backend Dependencies Ready for Extension:**

The backend already includes all necessary packages for OAuth implementation (Passport.js, express-session) and database operations (Firebase Admin, UUID generation).

---

## 🔄 Development Workflow

### Starting the Application

**Backend:**

```bash
cd backend
npm install
npm start  # Runs on port 3000
```

**Frontend:**

```bash
cd frontend  
npm install
npm run dev  # Vite dev server
```

### Testing API Endpoints

- Health Check: `GET http://localhost:3000/health`
- Create Session: `POST http://localhost:3000/session`
- Get Session: `GET http://localhost:3000/session/{code}`
- Get Session Participants: `GET http://localhost:3000/session/{code}/participants`
- Join Session: `POST http://localhost:3000/session/{code}/join`
- Last.fm Data: `GET http://localhost:3000/lastfm/top-artists/{username}`
- Last.fm Auth: `GET http://localhost:3000/auth/lastfm`
- Last.fm Callback: `GET http://localhost:3000/auth/lastfm/callback`

### Environment Setup

Ensure `.env` file exists in backend directory with required API keys and Firebase credentials.

---

This instructions file reflects the current implementation state and provides guidance for continuing development of The Playlist Exchange application. All major structural components are in place, with the next phase focusing on completing authentication flows and implementing the matching algorithm.
