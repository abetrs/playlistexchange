# The Playlist Exchange: instructions.md

This file will guide our collaboration in building "The Playlist Exchange" application. It outlines the project's goals, architecture, and the step-by-step plan we'll follow. Please use the context provided here to assist in code generation, problem-solving, and architectural decisions for our **Node.js (Express)** and **Svelte** stack.

---

## ⚠️ Important Development Guidelines

**Testing Policy:** Do not attempt to test, run, or start the application unless explicitly requested by the user. Focus on code generation, analysis, and architectural guidance only.

---

## 🚀 Project Overview

**The Playlist Exchange ("Itch")** is a session-based music discovery application that connects users with similar tastes for playlist exchanges. Users create or join sessions, share their music profiles via Last.fm/Spotify, and discover new music through taste-matched participants.

**Current Status:** Core session management, user creation, and participants dashboard fully implemented. Ready for music profile integration and matching algorithms.

**Tech Stack:** 
- **Backend:** Node.js/Express with Firebase/Firestore database
- **Frontend:** Svelte 5 with Vite (no external routing library - custom implementation)
- **APIs:** Spotify API, Last.fm API  
- **Database:** Firebase Firestore (production), In-memory (development)
- **Authentication:** Passport.js with OAuth2 flows

---

### ✅ MVP Features (Current Implementation Status)

**Completed:**
1. **Basic Project Structure:** Full-stack setup with modular backend architecture
2. **Session Management:** Create/join sessions with codes, Firestore integration, room capacity enforcement
3. **Frontend Navigation:** Custom routing system with Home, Create, Join, and Participants pages
4. **UI Components:** Complete component library with responsive design
5. **User Management:** Full CRUD operations for users with Last.fm integration
6. **Participants Dashboard:** Real-time session view with participant cards and capacity display
7. **Join Flow:** Complete user creation and session joining with Last.fm username input
8. **Share Functionality:** Copy session join links with modal feedback system
9. **Last.fm Integration:** OAuth authentication flow with Firestore user storage
10. **Room Capacity Management:** Backend validation and frontend error handling for full sessions

**In Progress:**
11. **Spotify Integration:** OAuth2 authentication flow (backend ready, frontend pending)

**Planned:**
12. **Taste Profile Analysis:** Process API data to create compatibility profiles
13. **User Matching Algorithm:** Compare profiles to generate compatibility scores
14. **Real-time Updates:** WebSocket support for live session updates
15. **Results Display:** UI for showing matched participants and recommendations

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
│   │   ├── user.controller.js   # User CRUD operations
│   │   ├── lastfm.controller.js
│   │   └── auth.controller.js   # Last.fm OAuth authentication
│   ├── routes/                  # API endpoints
│   │   ├── health.route.js
│   │   ├── session.route.js
│   │   ├── user.route.js        # User management routes
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
│   ├── config.js                # API endpoints configuration
│   ├── routes/                  # Page components
│   │   ├── Home.svelte          # Landing page
│   │   ├── Create.svelte        # Session creation
│   │   ├── Join.svelte          # Session joining with user creation
│   │   └── Participants.svelte  # Session dashboard with participant management
│   ├── lib/                     # Reusable components
│   │   ├── BrandContainer.svelte
│   │   ├── ActionsMenu.svelte
│   │   ├── CreateSection.svelte
│   │   ├── JoinSection.svelte
│   │   └── Counter.svelte       # Example component
│   └── assets/                  # Static resources (Last.fm, Spotify icons)
├── index.html
├── package.json
└── vite.config.js
```

### Implemented Features

**Current API Endpoints:**

- `GET /health` - Server health check
- `POST /session` - Create new session with group name/size
- `GET /session/:code` - Retrieve session information
- `GET /session/:code/participants` - Get enriched list of participants in a session
- `POST /session/:code/join` - Add user to session
- `POST /user` - Create new user with name and Last.fm username
- `GET /user/:code` - Get user by user code
- `GET /user/lastfm/:username` - Find user by Last.fm username
- `PUT /user/:code` - Update user information
- `DELETE /user/:code` - Delete user
- `GET /lastfm/top-artists/:user` - Fetch Last.fm user top artists
- `GET /lastfm/top-albums/:user` - Get top albums for a user
- `GET /lastfm/top-tracks/:user` - Get top tracks for a user
- `GET /lastfm/user/:user` - Get user info
- `GET /user/:code/lastfm` - Get Last.fm data for specific user
- `GET /user/session/:sessionCode/lastfm` - Get Last.fm data for all session participants
- `GET /auth/lastfm` - Initiate Last.fm OAuth authentication
- `GET /auth/lastfm/callback` - Handle Last.fm OAuth callback

**Frontend Pages:**

1. **Home Page** (`Home.svelte`) - Entry point with join/create options and session rejoin functionality
2. **Create Page** (`Create.svelte`) - Session creation with group name and size selection
3. **Join Page** (`Join.svelte`) - Join sessions with name and Last.fm username input
4. **Participants Page** (`Participants.svelte`) - Dashboard showing session participants and status

### New Features Implemented

**Participants Dashboard (`Participants.svelte`):**
- Real-time participant cards displaying user avatars (initials), names, and connection status
- Empty slot indicators that only show when less than 2 participants (to avoid clutter)
- Session information header with code and member count
- Share functionality with modal feedback system
- Start Exchange button (disabled until 2+ participants)
- Responsive grid layout for participant cards

**Enhanced Join Flow (`Join.svelte`):**
- Last.fm username validation (checks if username exists on Last.fm)
- Complete user creation and session joining workflow
- Duplicate user detection (checks for existing name or Last.fm username in session)
- Automatic navigation to participants page after successful join
- Session code pre-population from URL parameters
- Form validation for all required fields
- LocalStorage session tracking for rejoining functionality

**User Management System:**
- Complete user CRUD operations with unique user codes
- User model includes name, Last.fm username, Spotify ID, and profile data
- Automatic user code generation (8-character UUID)
- Integration with session participant system

**Share System:**
- Copy-to-clipboard functionality for session join links (`/join/{sessionCode}`)
- Modal popup feedback (5-second display) instead of button text changes
- Success/error state handling with different modal styles
- Fallback support for older browsers

**Session Persistence & Rejoin System:**
- LocalStorage tracking of user's last joined session
- "Join Session" button on home page for quick rejoining
- Automatic session info storage (session code, user name, session name)
- Dismissible rejoin prompt with visual feedback

**User Validation & Duplicate Prevention:**
- Real-time Last.fm username validation using Last.fm API
- Duplicate user detection (checks both display name and Last.fm username)
- Automatic redirection to existing session if duplicate found
- Alert notification for users attempting to rejoin with existing credentials

**Error Handling:**

Backend validation includes:

- Session capacity limits (1-20 participants)
- Room full detection (HTTP 403 with "Session is full" message)
- Duplicate user prevention (HTTP 409 for users already in session)
- Input validation for group size and required fields

Frontend error handling includes:

- Specific error messages for full sessions
- Network error detection and user-friendly messages
- Form validation before API calls
- Modal feedback for user actions

**Key UI Components:**

- `BrandContainer.svelte` - Displays "Itch" brand title (Instrument Serif font)
- `ActionsMenu.svelte` - Home page join/create interface
- `CreateSection.svelte` & `JoinSection.svelte` - Specialized form components
- `Participants.svelte` - Dashboard with participant cards, session info, and actions

**UI/UX Patterns:**

- **Modal System:** Non-intrusive feedback for user actions (copy success/failure)
- **Progressive Disclosure:** Empty participant slots only shown when needed (< 2 users)
- **Avatar Generation:** Automatic initials-based avatars from user names
- **Responsive Cards:** Participant information displayed in adaptive grid layout
- **Status Indicators:** Clear visual feedback for connection states and user presence
- **Action Feedback:** Immediate visual confirmation for user interactions

**Current Color Scheme:**

- Primary background: `#ffff60` (bright yellow)
- Component backgrounds: `#e8e8d0` (warm beige)
- Borders: `#000` (black, 2-3px solid)
- Interactive elements: `#f5f5f5` with hover states

### Application Flow

**Create Session Flow:**

1. User enters group name and selects group size (1-20 people)
2. Backend generates unique 6-character session code
3. User redirected to `/join/{sessionCode}` to add themselves to the session
4. After joining, user navigated to `/participants/{sessionCode}` dashboard

**Join Session Flow:**

1. User enters session code, display name, and Last.fm username
2. System validates session exists and has available capacity
3. If session is full, displays specific "session is full" error message
4. If space available, creates new user account and adds to session
5. User navigated to `/participants/{sessionCode}` dashboard

**Participants Dashboard Flow:**

1. Displays session information (name, code, member count)
2. Shows participant cards with avatars, names, and connection status
3. Empty slots shown only when less than 2 participants
4. Share button copies join link with modal feedback
5. Start Exchange button enabled when 2+ participants present

### Music Service Integration

**Environment Variables (.env):**

```bash
LASTFM_API_KEY=your_api_key
LASTFM_API_SECRET=your_api_secret
SESSION_SECRET=your_session_secret
GOOGLE_APPLICATION_CREDENTIALS="./serviceAccountKey.json"
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

Custom routing system using Svelte 5 `$state()` with URL parameter support:

```javascript
// Global navigation function in App.svelte
function navigate(path) {
  window.history.pushState({}, "", path);
  updatePath();
}
window.navigate = navigate;

// Routing logic with parameter extraction
{#if currentPath === "/"}
  <Home />
{:else if currentPath.startsWith("/join/")}
  <Join params={{ code: currentPath.split("/")[2] }} />
{:else if currentPath.startsWith("/participants/")}
  <Participants params={{ code: currentPath.split("/")[2] }} />
{/if}
```

Routes:

- `/` - Home page
- `/create` - Session creation
- `/join` - Join form (standalone)
- `/join/{sessionCode}` - Join form with pre-filled session code
- `/participants/{sessionCode}` - Session dashboard

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

### Environment Setup

Ensure `.env` file exists in backend directory with required API keys and Firebase credentials:

```bash
LASTFM_API_KEY=your_api_key
LASTFM_API_SECRET=your_api_secret
SESSION_SECRET=your_session_secret
GOOGLE_APPLICATION_CREDENTIALS="./serviceAccountKey.json"
```

---

## 🧪 Testing & Development Tools

### API Tester - Terminal User Interface

**Location:** `backend/api-tester.js`

A comprehensive Terminal User Interface (TUI) program for testing all API routes with dummy data.

**Features:**
- 🎯 **Interactive Menu**: Select from predefined API routes or create custom requests
- 🎨 **Colorful Output**: Easy-to-read colored responses and error messages
- 📊 **Detailed Responses**: Shows status codes, headers, and response data
- 🔧 **Custom Requests**: Create your own API requests on the fly
- 🏥 **Health Check**: Automatically checks if the server is running
- ⚡ **Fast & Easy**: No need to manually write curl commands or use Postman

**Usage:**
```bash
cd backend
npm run api-test
# or
node api-tester.js
```

**Available Test Routes:**
- 🏥 **Health Check** - `GET /health`
- 🔐 **Initiate LastFM Auth** - `GET /auth/lastfm`
- 🔑 **LastFM Auth Callback** - `GET /auth/lastfm/callback`
- 🎵 **Get Top Artists** - `GET /lastfm/top-artists/{user}`
- 📝 **Create Session** - `POST /session`
- 📋 **Get Session** - `GET /session/{code}`
- 👥 **Get Session Participants** - `GET /session/{code}/participants`
- 🚪 **Join Session** - `POST /session/{code}/join`
- 👤 **Create User** - `POST /user`
- 👥 **Get All Users** - `GET /user`
- 👤 **Get User by Code** - `GET /user/{code}`
- ✏️ **Update User** - `PUT /user/{code}`
- 🗑️ **Delete User** - `DELETE /user/{code}`
- 🎵 **Get User by LastFM Username** - `GET /user/lastfm/{username}`

**Sample Test Data:**
```json
// Session Creation
{
  "name": "Test Session",
  "description": "A test session created by API tester",
  "createdBy": "test-user-123"
}

// User Creation
{
  "lastfmUsername": "testuser123",
  "displayName": "Test User",
  "email": "test@example.com"
}
```

### Comprehensive Backend Route Testing

**Location:** `backend/test-all-routes.js`

A comprehensive test script that validates all API endpoints with automated testing flows.

**Usage:**
```bash
cd backend
npm test
# or
npm run test-routes
# or
node test-all-routes.js
```

**Test Features:**
- **Automatic Testing**: Health check → session flow → validation testing
- **Error Handling**: Tests full sessions, duplicate users, missing fields
- **Last.fm Integration**: API endpoint testing with environment validation
- **Interactive Option**: Manual Last.fm OAuth flow testing
- **Color-coded Output**: Green (success), Yellow (partial), Red (failure), Blue (info)

**Test Coverage:**
- Server connectivity validation
- Session creation, retrieval, and joining workflow
- User management CRUD operations
- Last.fm API integration endpoints
- Error cases and validation rules
- Environment configuration warnings

**Output Format:**
```bash
🟢 ✓ Health check passed
🟢 ✓ Session creation successful
🟢 ✓ Session retrieval working
🟡 ⚠ Last.fm API keys not configured
🔴 ✗ Failed test with detailed error info
```

---

## 🎵 Comprehensive Last.fm Integration

### Complete Last.fm Service Implementation

**Location:** `backend/src/services/lastfm.service.js`

The service layer provides direct access to all Last.fm API endpoints with comprehensive error handling.

**Available Methods:**

```javascript
// Top Lists
getTopArtists(user, period, limit)    // Get top artists for a user
getTopAlbums(user, period, limit)     // Get top albums for a user  
getTopTracks(user, period, limit)     // Get top tracks for a user

// User Information
getUserInfo(user)                     // Get user profile information
```

**Parameters:**
- `user` (required) - Last.fm username
- `period` (optional) - Time period: overall, 7day, 1month, 3month, 6month, 12month (default: overall)
- `limit` (optional) - Number of results (default: 10)

### Direct Last.fm API Routes

**Available Endpoints:**

```javascript
GET /lastfm/top-artists/:user     // Get top artists
GET /lastfm/top-albums/:user      // Get top albums
GET /lastfm/top-tracks/:user      // Get top tracks
GET /lastfm/user/:user            // Get user info
```

**Query Parameters:**
- `period` - Time period for top lists
- `limit` - Number of results to return

**Example Usage:**
```bash
GET /lastfm/top-artists/johndoe_music?period=1month&limit=15
GET /lastfm/user/johndoe_music
```

### Integrated User Routes

These routes integrate Last.fm data with the application's user database:

```javascript
GET /user/:code/lastfm              // Get Last.fm data for specific user
GET /user/session/:sessionCode/lastfm  // Get Last.fm data for all session participants
```

**Query Parameters:**
- `dataType` - Type of data: artists, albums, tracks, info (default: artists)
- `period` - Time period for top lists (not applicable for info)
- `limit` - Number of results

**Example Responses:**

**Top Artists Response:**
```json
{
  "topartists": {
    "artist": [
      {
        "name": "Radiohead",
        "playcount": "1337",
        "mbid": "a74b1b7f-71a5-4011-9441-d0b5e4122711",
        "url": "https://www.last.fm/music/Radiohead",
        "streamable": "0",
        "image": [...]
      }
    ],
    "@attr": {
      "user": "testuser",
      "total": "50",
      "page": "1",
      "perPage": "10",
      "totalPages": "5"
    }
  }
}
```

**User Profile Response:**
```json
{
  "user": {
    "name": "testuser",
    "realname": "Test User",
    "url": "https://www.last.fm/user/testuser",
    "country": "United States",
    "playcount": "12345",
    "artist_count": "567",
    "playlists": "8",
    "registered": {
      "unixtime": "1234567890",
      "#text": "2009-02-13 15:31"
    }
  }
}
```

**Session Profile Response:**
```json
{
  "session": {
    "code": "ABC123",
    "name": "My Music Group"
  },
  "participants": [
    {
      "user": {
        "code": "USER1234",
        "name": "John Doe",
        "lastfmUsername": "johndoe_music"
      },
      "lastfmData": {...}
    },
    {
      "user": {
        "code": "USER5678",
        "name": "Jane Smith",
        "lastfmUsername": null
      },
      "error": "no_lastfm_username",
      "lastfmData": null
    }
  ],
  "dataType": "artists",
  "period": "overall",
  "limit": 5
}
```

### Enhanced Database Integration

**Session Document (Firestore):**

```javascript
{
  code: "ABC123",           // 6-character uppercase UUID
  name: "My Music Group",   // User-provided group name
  maxSize: 5,              // Selected group size (1-20)
  participants: [          // Array of participant objects
    {
      userCode: "USER1234",
      name: "John Doe",
      lastfmUsername: "johndoe_music",
      spotifyId: null,
      joinedAt: Timestamp
    }
  ],
  createdAt: Timestamp,    // Creation date
  status: "waiting"        // Session status
}
```

**Complete User Model (Firestore):**

```javascript
{
  code: "USER1234",                   // 8-character uppercase UUID (document ID)
  name: "John Doe",                   // User's display name
  lastfmUsername: "johndoe_music",    // Last.fm username
  spotifyId: null,                    // Spotify user ID (when connected)
  createdAt: Timestamp,               // Account creation date
  updatedAt: Timestamp,               // Last modification date
  profileData: {                      // Music service profile data
    lastfm: null,                     // Last.fm profile data
    spotify: null                     // Spotify profile data
  }
}
```

**Last.fm Authentication Storage (Firestore `lastfm_users` collection):**

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

### Error Handling

**Comprehensive error handling for:**
- Last.fm API errors (user not found, API key issues, rate limiting)
- Application errors (missing usernames, invalid parameters, database errors)
- Network errors and timeouts

**Error Response Format:**
```json
{
  "message": "Last.fm user not found",
  "error": "lastfm_user_not_found",
  "user": {
    "code": "USER1234",
    "name": "John Doe",
    "lastfmUsername": "invalid_user"
  }
}
```

---

## 👥 Session Participants Page Implementation

### Complete Participants Dashboard

**Location:** `frontend/src/routes/Participants.svelte`

A comprehensive session dashboard that follows the established design system with advanced social features.

**Key Features:**

**Session Header:**
- Session name display with status badge
- Join code with copy-to-clipboard functionality
- Participant progress bar (X/Y members)
- Visual capacity indicators

**Sorting & Filtering:**
- Sort by join order or alphabetical
- Filter by connected services (All/Spotify/Last.fm)
- Real-time search functionality

**Participant Grid:**
- Responsive card layout optimized for all screen sizes
- User avatars with music note placeholders
- Names and connected service indicators
- Top artists displayed as tags
- Compatibility scores with color coding
- Online/offline status indicators

**Empty State Management:**
- Placeholder cards for unfilled slots
- Welcome message for new sessions
- Progressive disclosure (only show empty slots when < 2 participants)

**Actions Menu:**
- Refresh button for manual updates
- Share session functionality with modal feedback
- Start Exchange button (enabled when 2+ participants)

### User Modal Component

**Location:** `frontend/src/lib/UserModal.svelte`

**Features:**
- **Detailed User Profiles**: Avatar, stats (play count, country, join date)
- **Connected Services**: Visual indicators for Spotify/Last.fm connection status
- **Top Artists List**: Ranked display of user's favorite artists
- **Favorite Genres**: Tag-based genre display
- **Compatibility Visualization**: Circular progress indicator with descriptive text
- **Action Buttons**: Placeholder for future playlist exchange functionality
- **Keyboard & Accessibility Support**: ESC key to close, proper focus management

### Design System Implementation

**Music-Themed Design Elements:**
- Vinyl record and music note icons
- Artist-focused information display
- Genre tags styled like playlist labels
- Compatibility scoring with music-themed descriptions

**Responsive Grid System:**
- Auto-fit grid: 3 columns (desktop) → 2 columns (tablet) → 1 column (mobile)
- Card-based layout resembling "album covers" for users
- Consistent spacing and visual hierarchy

**Social Discovery Features:**
- Compatibility preview with color coding:
  - Red: <50% compatibility
  - Yellow: 50-80% compatibility  
  - Green: >80% compatibility
- Top artists showcase for quick music taste assessment
- Service connection status for exchange readiness
- Expandable user profiles with detailed music data

### Integration Requirements

**API Endpoints Used:**
```javascript
GET /session/:code              // Fetch session details
GET /session/:code/participants // Fetch participant list
GET /user/:code/lastfm         // Get Last.fm data for users
```

**Expected Data Structure:**
```javascript
// Session object
{
  groupName: "My Music Group",
  groupSize: 5,
  sessionCode: "ABC123"
}

// Participant object
{
  name: "John Doe",
  avatar: "https://...",
  spotifyConnected: true,
  lastfmConnected: false,
  topArtists: ["Artist 1", "Artist 2"],
  compatibilityScore: 85,
  online: true
}
```

**Navigation Usage:**
```javascript
// Navigate to participants page
window.navigate('/session/ABC123/participants');

// From Create.svelte after session creation
setTimeout(() => {
  window.navigate(`/session/${data.sessionCode}/participants`);
}, 1500);
```

### Future Enhancements

1. **WebSocket Integration**: Replace polling with real-time updates for participant joins/leaves
2. **Profile Data**: Connect to Last.fm/Spotify APIs for real user data
3. **Matching Algorithm**: Implement the compatibility scoring system
4. **Playlist Exchange**: Add the core functionality once matching is complete

---

This instructions file reflects the current implementation state and provides comprehensive guidance for testing, API integration, and user interface development for The Playlist Exchange application. All major structural components are in place, with robust testing tools and detailed integration guides for continued development.
