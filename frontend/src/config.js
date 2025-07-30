// Global configuration for the frontend
export const CONFIG = {
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173",
};

// API endpoints
export const API_ENDPOINTS = {
  // Session endpoints
  SESSIONS: `${CONFIG.BACKEND_URL}/session`,
  SESSION_BY_CODE: (code) => `${CONFIG.BACKEND_URL}/session/${code}`,
  SESSION_PARTICIPANTS: (code) =>
    `${CONFIG.BACKEND_URL}/session/${code}/participants`,
  JOIN_SESSION: (code) => `${CONFIG.BACKEND_URL}/session/${code}/join`,

  // Session matching endpoints
  COMPUTE_SESSION_MATCHES: (code) =>
    `${CONFIG.BACKEND_URL}/session/${code}/match`,
  GET_SESSION_MATCHES: (code) =>
    `${CONFIG.BACKEND_URL}/session/${code}/matches`,

  // User endpoints
  USERS: `${CONFIG.BACKEND_URL}/user`,
  USER_BY_CODE: (code) => `${CONFIG.BACKEND_URL}/user/${code}`,
  UPDATE_USER: (code) => `${CONFIG.BACKEND_URL}/user/${code}`,
  USER_BY_LASTFM: (username) => `${CONFIG.BACKEND_URL}/user/lastfm/${username}`,

  // User taste profile endpoints
  BUILD_USER_TASTE_PROFILE: (code) =>
    `${CONFIG.BACKEND_URL}/user/${code}/taste-profile`,
  GET_USER_TASTE_PROFILE: (code) =>
    `${CONFIG.BACKEND_URL}/user/${code}/taste-profile`,
  CALCULATE_USER_COMPATIBILITY: (codeA, codeB) =>
    `${CONFIG.BACKEND_URL}/user/${codeA}/compatibility/${codeB}`,
  BUILD_SESSION_TASTE_PROFILES: (sessionCode) =>
    `${CONFIG.BACKEND_URL}/user/session/${sessionCode}/taste-profiles`,

  // Health endpoint
  HEALTH: `${CONFIG.BACKEND_URL}/health`,

  // Last.fm endpoints
  LASTFM_TOP_ARTISTS: (user) =>
    `${CONFIG.BACKEND_URL}/lastfm/top-artists/${user}`,
  LASTFM_USER: (user) => `${CONFIG.BACKEND_URL}/lastfm/user/${user}`,
  LASTFM_AUTH: `${CONFIG.BACKEND_URL}/auth/lastfm`,
  LASTFM_CALLBACK: `${CONFIG.BACKEND_URL}/auth/lastfm/callback`,
};

export default CONFIG;
