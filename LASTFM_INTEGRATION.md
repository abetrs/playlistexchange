# Last.fm API Integration - Implementation Summary

## Overview

This document outlines the comprehensive Last.fm API integration implemented for the Playlist Exchange application. The integration provides access to user music data including top artists, albums, tracks, and user profile information.

## Features Implemented

### 1. Last.fm Service Layer (`lastfm.service.js`)

The service layer provides direct access to Last.fm API endpoints:

- **`getTopArtists(user, period, limit)`** - Get top artists for a user
- **`getTopAlbums(user, period, limit)`** - Get top albums for a user  
- **`getTopTracks(user, period, limit)`** - Get top tracks for a user
- **`getUserInfo(user)`** - Get user profile information

**Parameters:**
- `user` (required) - Last.fm username
- `period` (optional) - Time period: overall, 7day, 1month, 3month, 6month, 12month (default: overall)
- `limit` (optional) - Number of results (default: 10)

### 2. Direct Last.fm API Routes (`/lastfm/*`)

These routes provide direct access to Last.fm data:

- `GET /lastfm/top-artists/:user` - Get top artists
- `GET /lastfm/top-albums/:user` - Get top albums
- `GET /lastfm/top-tracks/:user` - Get top tracks
- `GET /lastfm/user/:user` - Get user info

**Query Parameters:**
- `period` - Time period for top lists
- `limit` - Number of results to return

### 3. Integrated User Routes (`/user/*`)

These routes integrate Last.fm data with the application's user database:

- `GET /user/:code/lastfm` - Get Last.fm data for a specific user by user code
- `GET /user/session/:sessionCode/lastfm` - Get Last.fm data for all participants in a session

**Query Parameters for User Routes:**
- `dataType` - Type of data: artists, albums, tracks, info (default: artists)
- `period` - Time period for top lists (not applicable for info)
- `limit` - Number of results

## Database Integration

### User Model Enhancement

The user model already includes Last.fm integration:

```javascript
{
  code: "USER1234",
  name: "John Doe",
  lastfmUsername: "johndoe_music", // Last.fm username stored here
  spotifyId: null,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  profileData: {
    lastfm: null,    // Can store cached Last.fm data
    spotify: null
  }
}
```

### Session-Based Queries

The `/user/session/:sessionCode/lastfm` endpoint allows fetching Last.fm data for all participants in a session simultaneously, enabling:

- Taste comparison across session participants
- Batch data collection for matching algorithms
- Efficient data aggregation for session analytics

## API Response Examples

### Top Artists Response
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

### User Profile Response
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
    "bootstrap": "0",
    "registered": {
      "unixtime": "1234567890",
      "#text": "2009-02-13 15:31"
    }
  }
}
```

### Integrated User Response
```json
{
  "user": {
    "code": "USER1234",
    "name": "John Doe",
    "lastfmUsername": "johndoe_music"
  },
  "dataType": "artists",
  "period": "overall",
  "limit": 10,
  "lastfmData": {
    "topartists": {...}
  }
}
```

### Session Profile Response
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

## Error Handling

The implementation includes comprehensive error handling:

### Last.fm API Errors
- User not found (404)
- API key issues (403/500)
- Rate limiting (429)
- Network errors

### Application Errors
- Missing Last.fm username
- Invalid parameters
- Database errors
- Missing users/sessions

### Error Response Format
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

## Configuration Requirements

### Environment Variables
```bash
LASTFM_API_KEY=your_lastfm_api_key
```

### Dependencies
- `axios` - HTTP client for Last.fm API calls
- `firebase-admin` - Database operations
- `uuid` - User code generation

## API Testing

The `api-tester.js` has been updated with comprehensive test routes for all new endpoints:

### Direct Last.fm Tests
- 🎵 Get Top Artists
- 💿 Get Top Albums  
- 🎧 Get Top Tracks
- 👤 Get Last.fm User Info

### Integrated User Tests
- 🎵 Get User Last.fm Profile (Top Artists)
- 💿 Get User Last.fm Profile (Top Albums)
- 🎧 Get User Last.fm Profile (Top Tracks)
- 📊 Get User Last.fm Info
- 👥 Get Session Last.fm Profiles

## Usage Examples

### Get Top Artists for a User
```bash
GET /user/USER1234/lastfm?dataType=artists&period=1month&limit=15
```

### Get All Session Participants' Top Tracks
```bash
GET /user/session/ABC123/lastfm?dataType=tracks&period=overall&limit=10
```

### Direct Last.fm Query
```bash
GET /lastfm/top-albums/johndoe_music?period=6month&limit=20
```

## Future Enhancements

1. **Caching Layer** - Store Last.fm data in user profiles for performance
2. **Taste Matching** - Implement algorithms using the collected data
3. **Real-time Updates** - WebSocket integration for live music data
4. **Data Visualization** - Frontend components to display music preferences
5. **Recommendation Engine** - Cross-participant music discovery

## Architecture Benefits

- **Modular Design** - Separate service, controller, and route layers
- **Database Integration** - Seamless connection with existing user system
- **Flexible Querying** - Support for various time periods and data types
- **Batch Operations** - Session-level data collection
- **Error Resilience** - Graceful handling of API failures
- **Testing Support** - Comprehensive API testing coverage

This implementation provides a solid foundation for building music-based matching and recommendation features in the Playlist Exchange application.
