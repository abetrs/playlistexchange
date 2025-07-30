<script>
  import BrandContainer from "../lib/BrandContainer.svelte";
  import { onMount } from "svelte";
  import lastfmIcon from "../assets/brandico_lastfm.svg";
  import spotifyIcon from "../assets/streamline_spotify-remix.svg";
  import { API_ENDPOINTS } from "../config.js";

  export let joinCode = "";
  let userName = "";
  let lastfmUsername = "";
  let selected = null;
  let isValidating = false;
  let errorMessage = "";

  // This will be passed from the navigation
  export let params = {};

  onMount(() => {
    // If joinCode was passed via params, use it
    if (params && params.code) {
      joinCode = params.code;
    }

    // Check if there's a session code in sessionStorage (from create flow)
    if (!joinCode) {
      const storedSessionCode = sessionStorage.getItem("sessionCode");
      if (storedSessionCode) {
        joinCode = storedSessionCode;
      }
    }
  });

  // Generate a random Last.fm username
  function generateRandomLastfmUsername() {
    const adjectives = [
      "cosmic",
      "stellar",
      "sonic",
      "electric",
      "neon",
      "digital",
      "vinyl",
      "retro",
      "indie",
      "ambient",
    ];
    const nouns = [
      "beats",
      "waves",
      "vibes",
      "sounds",
      "melody",
      "rhythm",
      "harmony",
      "echo",
      "pulse",
      "groove",
    ];
    const randomAdjective =
      adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 999) + 1;
    return `${randomAdjective}_${randomNoun}_${randomNumber}`;
  }

  // Validate Last.fm username by checking if user exists
  async function validateLastfmUsername(username) {
    try {
      const response = await fetch(API_ENDPOINTS.LASTFM_USER(username));
      return response.ok;
    } catch (error) {
      console.error("Error validating Last.fm username:", error);
      return false;
    }
  }

  // Check if user already exists in this session
  async function checkExistingUser(sessionCode, userName, lastfmUsername) {
    try {
      const response = await fetch(
        API_ENDPOINTS.SESSION_PARTICIPANTS(sessionCode)
      );
      if (!response.ok) return { type: "none", user: null };

      const data = await response.json();
      const participants = data.participants || [];

      // Check for duplicate Last.fm username (takes priority)
      for (const participant of participants) {
        if (participant.lastfmUsername === lastfmUsername) {
          return { type: "lastfm", user: participant };
        }
      }

      // Check for duplicate display name
      for (const participant of participants) {
        if (participant.name === userName) {
          return { type: "name", user: participant };
        }
      }

      return { type: "none", user: null };
    } catch (error) {
      console.error("Error checking existing users:", error);
      return { type: "none", user: null };
    }
  }

  // Store session info in localStorage
  function storeSessionInfo(
    sessionCode,
    userName,
    sessionName,
    userCode = null
  ) {
    const sessionInfo = {
      sessionCode,
      userName,
      sessionName,
      userCode,
      joinedAt: new Date().toISOString(),
    };
    localStorage.setItem("lastJoinedSession", JSON.stringify(sessionInfo));
  }

  async function connectLastfm() {
    if (!userName.trim()) {
      errorMessage = "Please enter your name first";
      return;
    }

    if (!lastfmUsername.trim()) {
      errorMessage = "Please enter your Last.fm username";
      return;
    }

    if (!joinCode.trim()) {
      errorMessage = "Please enter a session code first";
      return;
    }

    isValidating = true;
    errorMessage = "";

    try {
      // First validate that the session exists
      const sessionResponse = await fetch(
        API_ENDPOINTS.SESSION_BY_CODE(joinCode.trim())
      );

      if (!sessionResponse.ok) {
        errorMessage = "Session not found. Please check the session code.";
        return;
      }

      const sessionData = await sessionResponse.json();

      // Validate Last.fm username
      const isValidLastfm = await validateLastfmUsername(lastfmUsername.trim());
      if (!isValidLastfm) {
        errorMessage =
          "Invalid Last.fm username. Please enter a valid Last.fm username.";
        return;
      }

      // Check if user already exists in this session
      const existingUserCheck = await checkExistingUser(
        joinCode.trim(),
        userName.trim(),
        lastfmUsername.trim()
      );

      if (existingUserCheck.type === "name") {
        errorMessage =
          "Username already exists. Please choose a different name.";
        return;
      }

      if (existingUserCheck.type === "lastfm") {
        // Store session info and redirect to existing session (same Last.fm user)
        storeSessionInfo(
          joinCode.trim(),
          existingUserCheck.user.name,
          sessionData.name
        );
        alert(
          `Logging you in as existing user: ${existingUserCheck.user.name}`
        );
        window.navigate(`/participants/${joinCode.trim()}`);
        return;
      }

      // Create a new user with the provided data and Last.fm username
      const createUserResponse = await fetch(API_ENDPOINTS.USERS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userName.trim(),
          lastfmUsername: lastfmUsername.trim(),
        }),
      });

      if (!createUserResponse.ok) {
        const createUserError = await createUserResponse.json();
        errorMessage = createUserError.message || "Failed to create user";
        return;
      }

      const newUser = await createUserResponse.json();

      // Join the session with the new user code
      const joinResponse = await fetch(
        API_ENDPOINTS.JOIN_SESSION(joinCode.trim()),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userCode: newUser.userCode,
          }),
        }
      );

      if (!joinResponse.ok) {
        const joinError = await joinResponse.json();

        // Handle specific error cases
        if (
          joinResponse.status === 403 &&
          joinError.message === "Session is full"
        ) {
          errorMessage =
            "This session is full and cannot accept more participants.";
        } else if (joinResponse.status === 409) {
          errorMessage = "You are already in this session.";
        } else {
          errorMessage = joinError.message || "Failed to join session";
        }
        return;
      }

      // Store session info in localStorage for future rejoining
      storeSessionInfo(
        joinCode.trim(),
        userName.trim(),
        sessionData.name,
        newUser.userCode
      );

      // Clear any stored session data since we've successfully joined
      sessionStorage.removeItem("sessionCode");
      sessionStorage.removeItem("isCreator");

      // Successfully joined - navigate to participants page
      window.navigate(`/participants/${joinCode.trim()}`);
    } catch (error) {
      console.error("Error creating user:", error);
      errorMessage = "Failed to create user";
    } finally {
      isValidating = false;
    }
  }

  function connectSpotify() {
    console.log("Connecting to Spotify with name:", userName);
    // Add Spotify connection logic here
  }

  function goBack() {
    window.navigate("/");
  }
</script>

<main>
  <BrandContainer />

  <div class="join-menu">
    <div class="menu-header">
      <button class="back-button" on:click={goBack}>← Back</button>
    </div>

    <div class="form-section">
      <div class="input-section">
        {#if !joinCode}
          <input
            type="text"
            bind:value={joinCode}
            placeholder="Enter Session Code"
            class="session-code-input"
          />
        {:else}
          <div class="session-info">
            <span class="session-label">Session Code:</span>
            <span class="session-code">{joinCode}</span>
          </div>
        {/if}

        <input
          type="text"
          bind:value={userName}
          placeholder="Enter Your Name"
          class="name-input"
        />
      </div>

      <div class="connection-section">
        <div class="lastfm-input-section">
          <input
            type="text"
            bind:value={lastfmUsername}
            placeholder="Enter Last.fm Username"
            class="lastfm-input"
          />
          <button
            class="lastfm-connect-button"
            on:click={connectLastfm}
            disabled={isValidating ||
              !userName.trim() ||
              !lastfmUsername.trim() ||
              !joinCode.trim()}
          >
            {#if isValidating}
              Connecting...
            {:else}
              <img src={lastfmIcon} alt="Last.fm" class="icon" />
              Continue
            {/if}
          </button>
        </div>

        {#if errorMessage}
          <div class="error-message">{errorMessage}</div>
        {/if}

        <button class="connection-button spotify" on:click={connectSpotify}>
          <img src={spotifyIcon} alt="Spotify" class="icon" />
          <span>Connect to Spotify</span>
        </button>
      </div>
    </div>
  </div>
</main>

<style>
  main {
    min-height: 100vh;
    background-color: #ffff60;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    position: relative;
    overflow-y: auto;
  }

  .join-menu {
    background-color: #e8e8d0;
    border: 3px solid #000;
    border-radius: 15px;
    padding: 3rem;
    width: 90%;
    max-width: 600px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }

  .menu-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .back-button {
    font-size: 18pt;
    font-family: "Instrument Serif", serif;
    padding: 0.5rem 1rem;
    background-color: #d0d0b8;
    color: #000;
    border: 2px solid #000;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .back-button:hover {
    background-color: #b8b8a0;
    transform: translateY(-1px);
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .input-section {
    display: flex;
    justify-content: center;
  }

  .name-input {
    font-family: "Instrument Serif", serif;
    font-size: 20pt;
    padding: 1rem 1.5rem;
    border: 2px solid #000;
    border-radius: 8px;
    background-color: #f5f5f5;
    color: #000;
    text-align: center;
    width: 100%;
    max-width: 400px;
    outline: none;
    transition: all 0.2s ease;
  }

  .session-code-input {
    font-family: "Instrument Serif", serif;
    font-size: 18pt;
    padding: 1rem 1.5rem;
    border: 2px solid #000;
    border-radius: 8px;
    background-color: #f5f5f5;
    color: #000;
    text-align: center;
    width: 100%;
    max-width: 400px;
    outline: none;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .session-code-input:focus {
    background-color: #fff;
    border-color: #646cff;
    box-shadow: 0 0 0 3px rgba(100, 108, 255, 0.1);
  }

  .session-code-input::placeholder {
    color: #888;
    font-style: italic;
    text-transform: none;
    letter-spacing: normal;
  }

  .session-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background-color: #e8e8d0;
    border: 2px solid #000;
    border-radius: 8px;
    width: 100%;
    max-width: 400px;
  }

  .session-label {
    font-size: 16pt;
    color: #666;
    font-weight: normal;
  }

  .session-code {
    font-size: 24pt;
    font-weight: bold;
    color: #000;
    letter-spacing: 3px;
    text-transform: uppercase;
  }

  .name-input:focus {
    background-color: #fff;
    border-color: #646cff;
    box-shadow: 0 0 0 3px rgba(100, 108, 255, 0.1);
  }

  .name-input::placeholder {
    color: #888;
    font-style: italic;
  }

  .connection-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .lastfm-input-section {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
    width: 100%;
  }

  .lastfm-input {
    flex: 1;
    font-family: "Instrument Serif", serif;
    font-size: 20pt;
    padding: 1rem 1.5rem;
    border: 2px solid #000;
    border-radius: 8px;
    background-color: #f5f5f5;
    color: #000;
    text-align: center;
    outline: none;
    transition: all 0.2s ease;
  }

  .lastfm-input:focus {
    background-color: #fff;
    border-color: #646cff;
    box-shadow: 0 0 0 3px rgba(100, 108, 255, 0.1);
  }

  .lastfm-input::placeholder {
    color: #888;
    font-style: italic;
  }

  .lastfm-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .lastfm-connect-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-family: "Instrument Serif", serif;
    font-size: 18pt;
    padding: 1rem 1.5rem;
    background-color: #d0d0b8;
    color: #000;
    border: 2px solid #000;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .lastfm-connect-button:hover:not(:disabled) {
    background-color: #b8b8a0;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .lastfm-connect-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .error-message {
    background-color: #ffe6e6;
    border: 2px solid #ff4444;
    border-radius: 8px;
    color: #cc0000;
    padding: 0.8rem;
    text-align: center;
    font-size: 16pt;
  }

  .connection-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    font-family: "Instrument Serif", serif;
    font-size: 20pt;
    padding: 1rem 2rem;
    background-color: #f5f5f5;
    color: #000;
    border: 2px solid #000;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
  }

  .connection-button:hover {
    background-color: #fff;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .connection-button.lastfm {
    background-color: #f5f5f5;
  }

  .connection-button.spotify {
    background-color: #f5f5f5;
  }

  .icon {
    height: 1.5em;
    width: auto;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .attribution {
      font-size: 16pt;
    }

    .join-menu {
      padding: 2rem;
      width: 95%;
    }

    .menu-title {
      font-size: 20pt;
    }

    .name-input,
    .session-code-input,
    .connection-button {
      font-size: 18pt;
    }

    .session-code {
      font-size: 20pt;
      letter-spacing: 2px;
    }

    .session-label {
      font-size: 14pt;
    }

    .lastfm-connect-button {
      font-size: 16pt;
      padding: 0.8rem 1.2rem;
    }

    .lastfm-input-section {
      flex-direction: column;
      gap: 0.8rem;
    }

    .lastfm-connect-button {
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    .join-menu {
      padding: 1.5rem;
    }

    .menu-title {
      font-size: 18pt;
    }

    .name-input,
    .session-code-input,
    .connection-button {
      font-size: 16pt;
      padding: 0.6rem 1rem;
    }

    .session-code {
      font-size: 18pt;
      letter-spacing: 1px;
    }

    .session-label {
      font-size: 12pt;
    }

    .lastfm-connect-button {
      font-size: 14pt;
      padding: 0.6rem 1rem;
    }

    .error-message {
      font-size: 14pt;
      padding: 0.6rem;
    }
  }
</style>
