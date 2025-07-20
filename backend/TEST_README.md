# Backend Route Testing Script

This comprehensive test script validates all API endpoints for The Playlist Exchange backend as specified in `instructions.md`.

## Routes Tested

The script tests all implemented backend routes:

### Health Check
- `GET /health` - Server health check

### Session Management
- `POST /session` - Create new session with group name/size
- `GET /session/:code` - Retrieve session information  
- `GET /session/:code/participants` - Get list of participants in a session
- `POST /session/:code/join` - Add user to session

### Last.fm Integration
- `GET /lastfm/top-artists/:user` - Fetch Last.fm user top artists
- `GET /auth/lastfm` - Initiate Last.fm OAuth authentication
- `GET /auth/lastfm/callback` - Handle Last.fm OAuth callback

## Prerequisites

1. **Backend server must be running:**
   ```bash
   cd backend
   npm start
   ```
   Server should be accessible at `http://localhost:3000`

2. **Environment variables configured:**
   - `LASTFM_API_KEY` - For Last.fm API integration
   - `LASTFM_API_SECRET` - For Last.fm authentication
   - Firebase configuration for session storage

## Usage

### Method 1: Using npm script (Recommended)
```bash
cd backend
npm test
# or
npm run test-routes
```

### Method 2: Direct execution
```bash
cd backend
node test-all-routes.js
```

### Method 3: Using PowerShell (Windows)
```powershell
cd backend
node test-all-routes.js
```

## Test Features

### Automatic Testing
- **Health Check:** Validates server is responding
- **Session Flow:** Creates session → retrieves → joins → gets participants
- **Validation Testing:** Tests error cases (missing fields, invalid data, non-existent resources)
- **Last.fm Integration:** Tests API endpoints (may require valid API keys)

### Manual Testing Option
The script offers an interactive option to test the complete Last.fm OAuth flow:
1. Opens auth URL in browser
2. Complete Last.fm authorization  
3. Observe callback handling

### Error Handling
- Network connectivity validation
- Graceful handling of API errors
- Environment configuration warnings
- Detailed error reporting with color-coded output

## Output Format

The script provides color-coded output:
- 🟢 **Green:** Successful tests
- 🟡 **Yellow:** Partial success (environment/config issues)
- 🔴 **Red:** Failed tests
- 🔵 **Blue:** Informational messages

## Test Results

### Success Criteria
- All critical endpoints respond correctly
- Validation rules work as expected
- Session management flow completes
- Error cases handled gracefully

### Partial Success
Some tests may show "partial" success if:
- Last.fm API keys not configured
- External API services unavailable
- Database connection issues

### Common Issues

1. **Server not running:**
   ```
   ❌ Cannot connect to server!
   Make sure the backend server is running on http://localhost:3000
   ```

2. **Missing environment variables:**
   ```
   ⚠️ Last.fm API key might not be configured
   ```

3. **Database connection issues:**
   ```
   ❌ Session creation failed - Database error
   ```

## Test State Tracking

The script maintains state across tests:
- Creates a test session for subsequent tests
- Uses generated session codes for join/retrieve operations  
- Tracks test user across session operations
- Preserves session data for reference

## Exit Codes

- `0` - All tests passed or acceptable partial results
- `1` - Critical failures or server unreachable

## Extending the Tests

To add new route tests:

1. Add test function following the pattern:
   ```javascript
   async function testNewRoute() {
     logSubHeader('Testing New Route');
     const response = await makeRequest('GET', '/new-route');
     // Add assertions and logging
     return response.status === 200;
   }
   ```

2. Add to the tests array:
   ```javascript
   const tests = [
     // existing tests...
     { name: 'New Route', fn: testNewRoute }
   ];
   ```

## Implementation Notes

- Built with Node.js and axios for HTTP requests
- No external testing frameworks required
- Self-contained with built-in assertions
- Follows the backend architecture from instructions.md
- Compatible with Windows PowerShell environment

## Troubleshooting

### Server Connection Issues
1. Verify backend server is running: `cd backend && npm start`
2. Check port 3000 is available
3. Ensure no firewall blocking localhost connections

### API Key Issues  
1. Verify `.env` file exists in backend directory
2. Check `LASTFM_API_KEY` and `LASTFM_API_SECRET` are set
3. Validate API keys with Last.fm developer console

### Database Issues
1. Verify Firebase configuration
2. Check `serviceAccountKey.json` exists
3. Ensure Firestore rules allow read/write operations

---

**Created for The Playlist Exchange backend testing as specified in instructions.md**
