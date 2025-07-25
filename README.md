# The Playlist Exchange

The Playlist Exchange is an application that connects users with similar music tastes, allowing them to exchange playlists. The app will use data from the Spotify and/or Last.fm APIs to analyze user taste profiles and suggest ideal matches for a playlist swap.

## Quick Setup

### Environment Configuration

1. **Backend Setup:**

   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your API keys and configuration
   npm install
   npm start
   ```

2. **Frontend Setup:**

   ```bash
   cd frontend
   cp .env.example .env
   # Edit .env if you need different URLs
   npm install
   npm run dev
   ```

### Environment Variables

**Backend (.env):**

- `PORT` - Server port (default: 3000)
- `BACKEND_URL` - Backend URL for API calls
- `FRONTEND_URL` - Frontend URL for CORS/redirects
- `LASTFM_API_KEY` - Your Last.fm API key
- `LASTFM_API_SECRET` - Your Last.fm API secret
- `SESSION_SECRET` - Secret for session management
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to Firebase service account key

**Frontend (.env):**

- `VITE_BACKEND_URL` - Backend API URL (default: <http://localhost:3000>)
- `VITE_FRONTEND_URL` - Frontend URL (default: <http://localhost:5173>)

## Development

The application uses environment variables for configuration, making it easy to deploy to different environments. All API endpoints and URLs are configurable through environment variables rather than hardcoded values.