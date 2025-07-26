# Playlist Exchange Backend

A Node.js/Express backend for the Playlist Exchange application, providing session management, user management, and Last.fm API integration.

## Features

### Core Features
- **Session Management** - Create and join music exchange sessions
- **User Management** - User creation and profile management with Last.fm integration
- **Health Monitoring** - Server health check endpoints
- **Authentication** - Last.fm OAuth integration

### Last.fm Integration
- **Direct API Access** - Get top artists, albums, tracks, and user info from Last.fm
- **Database Integration** - Seamless integration with user profiles
- **Session-Based Queries** - Batch Last.fm data retrieval for session participants
- **Flexible Querying** - Support for various time periods and data limits

## API Endpoints

### Health
- `GET /health` - Server health check

### Sessions
- `POST /session` - Create new session
- `GET /session/:code` - Get session information
- `GET /session/:code/participants` - Get session participants
- `POST /session/:code/join` - Join session

### Users
- `POST /user` - Create user
- `GET /user` - Get all users
- `GET /user/:code` - Get user by code
- `PUT /user/:code` - Update user
- `DELETE /user/:code` - Delete user
- `GET /user/lastfm/:username` - Find user by Last.fm username

### User Last.fm Integration
- `GET /user/:code/lastfm` - Get Last.fm data for user
- `GET /user/session/:sessionCode/lastfm` - Get Last.fm data for all session participants

### Direct Last.fm API
- `GET /lastfm/top-artists/:user` - Get top artists
- `GET /lastfm/top-albums/:user` - Get top albums
- `GET /lastfm/top-tracks/:user` - Get top tracks
- `GET /lastfm/user/:user` - Get user info

### Authentication
- `GET /auth/lastfm` - Initiate Last.fm OAuth
- `GET /auth/lastfm/callback` - Handle OAuth callback

## Configuration

### Environment Variables
```bash
LASTFM_API_KEY=your_lastfm_api_key
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Firebase Setup
1. Create a Firebase project
2. Enable Firestore
3. Download service account key as `serviceAccountKey.json`
4. Place in backend root directory

## Installation & Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start server
npm start

# Run API tests
npm run api-test
```

## Database Schema

### Users Collection
```javascript
{
  code: "USER1234",           // 8-character UUID
  name: "John Doe",           // Display name
  lastfmUsername: "johndoe",  // Last.fm username
  spotifyId: null,            // Spotify ID (future)
  createdAt: Timestamp,
  updatedAt: Timestamp,
  profileData: {
    lastfm: null,             // Cached Last.fm data
    spotify: null             // Cached Spotify data
  }
}
```

### Sessions Collection
```javascript
{
  code: "ABC123",             // 6-character session code
  name: "My Music Group",     // Session name
  maxSize: 5,                 // Maximum participants
  participants: [             // Array of participants
    {
      userCode: "USER1234",
      name: "John Doe",
      lastfmUsername: "johndoe",
      joinedAt: Timestamp
    }
  ],
  createdAt: Timestamp,
  status: "waiting"
}
```

## API Testing

Use the built-in API tester to test all endpoints:

```bash
npm run api-test
```

The API tester provides an interactive menu to test all available endpoints with sample data.

## Last.fm Integration Features

### Query Parameters

**For Top Lists (artists, albums, tracks):**
- `period` - Time period: overall, 7day, 1month, 3month, 6month, 12month
- `limit` - Number of results (default: 10)

**For User Integration:**
- `dataType` - Type of data: artists, albums, tracks, info
- `period` - Time period (not applicable for info)
- `limit` - Number of results

### Example Requests

```bash
# Get user's top artists from last month
GET /user/USER1234/lastfm?dataType=artists&period=1month&limit=15

# Get all session participants' top tracks
GET /user/session/ABC123/lastfm?dataType=tracks&period=overall&limit=10

# Direct Last.fm query
GET /lastfm/top-albums/johndoe?period=6month&limit=20
```

## Error Handling

The API provides comprehensive error handling with specific error codes:

- `user_not_found` - User doesn't exist
- `lastfm_user_not_found` - Last.fm user not found
- `no_lastfm_username` - User has no Last.fm username
- `api_config_error` - Last.fm API configuration issue
- `session_full` - Session has reached capacity

## Dependencies

- **express** - Web framework
- **axios** - HTTP client for Last.fm API
- **firebase-admin** - Database operations
- **cors** - Cross-origin resource sharing
- **uuid** - Unique ID generation
- **dotenv** - Environment variable management

## Architecture

```
src/
├── index.js              # Main server setup
├── firebase.js           # Firebase configuration
├── database.js           # In-memory database (development)
├── controllers/          # Request handlers
│   ├── auth.controller.js
│   ├── health.controller.js
│   ├── lastfm.controller.js
│   ├── session.controller.js
│   └── user.controller.js
├── routes/               # API endpoints
│   ├── auth.route.js
│   ├── health.route.js
│   ├── lastfm.route.js
│   ├── session.route.js
│   └── user.route.js
└── services/             # External API integration
    └── lastfm.service.js
```

## Development

### Adding New Last.fm Features

1. Add method to `services/lastfm.service.js`
2. Add controller method to `controllers/lastfm.controller.js`
3. Add route to `routes/lastfm.route.js`
4. Add test case to `api-tester.js`

### Testing

The API tester (`api-tester.js`) provides comprehensive testing for all endpoints with sample data and parameter variations.

## Future Enhancements

- Caching layer for Last.fm data
- Spotify API integration
- Taste matching algorithms
- Real-time WebSocket updates
- Data visualization endpoints
