# API Tester - TUI for Testing Playlist Exchange Backend

This is a Terminal User Interface (TUI) program that allows you to test all the API routes in the Playlist Exchange backend with dummy data.

## Features

- 🎯 **Interactive Menu**: Select from predefined API routes or create custom requests
- 🎨 **Colorful Output**: Easy-to-read colored responses and error messages
- 📊 **Detailed Responses**: Shows status codes, headers, and response data
- 🔧 **Custom Requests**: Create your own API requests on the fly
- 🏥 **Health Check**: Automatically checks if the server is running
- ⚡ **Fast & Easy**: No need to manually write curl commands or use Postman

## Installation

The required dependencies should already be installed. If not, run:

```bash
npm install inquirer chalk axios
```

## Usage

1. **Start the Backend Server** (in a separate terminal):
   ```bash
   npm start
   ```

2. **Run the API Tester**:
   ```bash
   npm run api-test
   ```
   or
   ```bash
   node api-tester.js
   ```

3. **Navigate the Menu**:
   - Use arrow keys to navigate through the API routes
   - Press Enter to select a route
   - The program will automatically send the request with dummy data
   - View the response and press Enter to continue

## Available API Routes

### Health
- 🏥 **Health Check** - `GET /health`

### Authentication
- 🔐 **Initiate LastFM Auth** - `GET /auth/lastfm`
- 🔑 **LastFM Auth Callback** - `GET /auth/lastfm/callback`

### LastFM Integration
- 🎵 **Get Top Artists** - `GET /lastfm/top-artists/{user}`

### Session Management
- 📝 **Create Session** - `POST /session`
- 📋 **Get Session** - `GET /session/{code}`
- 👥 **Get Session Participants** - `GET /session/{code}/participants`
- 🚪 **Join Session** - `POST /session/{code}/join`

### User Management
- 👤 **Create User** - `POST /user`
- 👥 **Get All Users** - `GET /user`
- 👤 **Get User by Code** - `GET /user/{code}`
- ✏️ **Update User** - `PUT /user/{code}`
- 🗑️ **Delete User** - `DELETE /user/{code}`
- 🎵 **Get User by LastFM Username** - `GET /user/lastfm/{username}`

## Custom Requests

You can also create custom API requests by selecting "🔧 Custom Request" from the menu. This allows you to:

- Choose the HTTP method (GET, POST, PUT, DELETE, PATCH)
- Enter a custom URL endpoint
- Add JSON body data for POST/PUT/PATCH requests

## Sample Test Data

The program uses the following dummy data for testing:

### Session Creation:
```json
{
  "name": "Test Session",
  "description": "A test session created by API tester",
  "createdBy": "test-user-123"
}
```

### User Creation:
```json
{
  "lastfmUsername": "testuser123",
  "displayName": "Test User",
  "email": "test@example.com"
}
```

### Join Session:
```json
{
  "userCode": "test-user-456",
  "username": "TestUser"
}
```

## Configuration

You can modify the `BASE_URL` constant in `api-tester.js` if your server is running on a different port:

```javascript
const BASE_URL = 'http://localhost:3000'; // Change port here if needed
```

## Tips

1. **Server Must Be Running**: Make sure your backend server is running before using the tester
2. **Replace Placeholder Values**: Some routes use placeholder values (like "TEST123" for session codes) - replace these with actual values when testing
3. **Sequential Testing**: For best results, test routes in logical order (e.g., create a session before trying to join it)
4. **Error Handling**: The tester will show detailed error messages if requests fail

## Troubleshooting

- **Server Not Running**: If you see "Server is not running", start the backend with `npm start`
- **Port Issues**: If the server is on a different port, update the `BASE_URL` in the code
- **JSON Errors**: When entering custom JSON data, ensure it's valid JSON format
- **Network Timeouts**: Requests timeout after 10 seconds - check your server logs if this happens

## Exit

To exit the program, select "🚪 Exit" from the menu or press `Ctrl+C`.
