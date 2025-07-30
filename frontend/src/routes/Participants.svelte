<script>
  import BrandContainer from "../lib/BrandContainer.svelte";
  import { onMount } from "svelte";
  import lastfmIcon from "../assets/brandico_lastfm.svg";
  import spotifyIcon from "../assets/streamline_spotify-remix.svg";
  import { API_ENDPOINTS } from "../config.js";

  export let params = {};

  let sessionCode = "";
  let sessionData = null;
  let participants = [];
  let isLoading = true;
  let errorMessage = "";
  let showModal = false;
  let modalMessage = "";
  let modalType = "success"; // "success" or "error"
  let isMatching = false;
  let hasExistingMatches = false;

  onMount(async () => {
    // Get session code from params
    if (params && params.code) {
      sessionCode = params.code;
    } else {
      // Fallback to extracting from URL path
      const pathParts = window.location.pathname.split("/");
      sessionCode = pathParts[pathParts.length - 1];
    }

    if (sessionCode) {
      await loadSessionData();
    } else {
      errorMessage = "No session code provided";
      isLoading = false;
    }
  });

  async function loadSessionData() {
    try {
      // Fetch session details
      const sessionResponse = await fetch(
        API_ENDPOINTS.SESSION_BY_CODE(sessionCode)
      );

      if (!sessionResponse.ok) {
        errorMessage = "Session not found";
        return;
      }

      sessionData = await sessionResponse.json();

      // Fetch participants with full user data
      const participantsResponse = await fetch(
        API_ENDPOINTS.SESSION_PARTICIPANTS(sessionCode)
      );

      if (participantsResponse.ok) {
        const participantsData = await participantsResponse.json();
        participants = participantsData.participants || [];
      } else {
        console.error("Failed to fetch participants");
        participants = [];
      }

      // Check for existing matches
      await checkForExistingMatches();
    } catch (error) {
      console.error("Error loading session data:", error);
      errorMessage = "Failed to load session data";
    } finally {
      isLoading = false;
    }
  }

  async function checkForExistingMatches() {
    try {
      const matchesResponse = await fetch(
        API_ENDPOINTS.GET_SESSION_MATCHES(sessionCode)
      );

      if (matchesResponse.ok) {
        const matchesData = await matchesResponse.json();
        console.log("Checking for existing matches:", matchesData); // Debug log
        hasExistingMatches =
          matchesData.hasMatches ||
          (matchesData.matches && matchesData.matches.length > 0);
        console.log("Has existing matches:", hasExistingMatches); // Debug log
      }
    } catch (error) {
      console.error("Error checking for existing matches:", error);
      hasExistingMatches = false;
    }
  }

  function goBack() {
    window.navigate("/");
  }

  function getInitials(name) {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }

  function formatConnectionStatus(participant) {
    if (participant.lastfmConnected && participant.spotifyConnected) {
      return "Last.fm & Spotify";
    } else if (participant.lastfmConnected) {
      return "Last.fm";
    } else if (participant.spotifyConnected) {
      return "Spotify";
    } else {
      return "No connections";
    }
  }

  async function shareSessionCode() {
    const joinUrl = `${window.location.origin}/join/${sessionCode}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(joinUrl);
        showSuccessModal("Link copied to clipboard!");
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = joinUrl;
        document.body.appendChild(textArea);
        textArea.select();
        textArea.setSelectionRange(0, 99999);
        document.execCommand("copy");
        document.body.removeChild(textArea);
        showSuccessModal("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      showErrorModal("Failed to copy link");
    }
  }

  function showSuccessModal(message) {
    modalMessage = message;
    modalType = "success";
    showModal = true;
    setTimeout(() => {
      showModal = false;
    }, 5000);
  }

  function showErrorModal(message) {
    modalMessage = message;
    modalType = "error";
    showModal = true;
    setTimeout(() => {
      showModal = false;
    }, 5000);
  }

  async function startMatching() {
    if (participants.length < 2) {
      showErrorModal("Need at least 2 participants to start matching");
      return;
    }

    isMatching = true;

    try {
      // First, build taste profiles for all participants
      showSuccessModal("Building taste profiles...");

      const profilesResponse = await fetch(
        API_ENDPOINTS.BUILD_SESSION_TASTE_PROFILES(sessionCode),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!profilesResponse.ok) {
        const errorData = await profilesResponse.json();
        throw new Error(errorData.message || "Failed to build taste profiles");
      }

      // Then compute matches
      showSuccessModal("Computing matches...");

      const matchResponse = await fetch(
        API_ENDPOINTS.COMPUTE_SESSION_MATCHES(sessionCode),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!matchResponse.ok) {
        const errorData = await matchResponse.json();
        throw new Error(errorData.message || "Failed to compute matches");
      }

      const matchData = await matchResponse.json();
      console.log("Matches computed:", matchData);

      showSuccessModal("Matching complete!");

      // Update the state to show matches are available
      hasExistingMatches = true;
    } catch (error) {
      console.error("Error starting matching:", error);
      showErrorModal(`Failed to start matching: ${error.message}`);
    } finally {
      isMatching = false;
    }
  }

  function viewMatches() {
    window.navigate(`/results/${sessionCode}`);
  }
</script>

<main>
  <BrandContainer />

  <div class="participants-container">
    <div class="menu-header">
      <button class="back-button" on:click={goBack}>← Back</button>
      {#if sessionData}
        <h1 class="session-title">{sessionData.name}</h1>
      {/if}
    </div>

    {#if isLoading}
      <div class="loading">Loading participants...</div>
    {:else if errorMessage}
      <div class="error-message">{errorMessage}</div>
    {:else if sessionData}
      <div class="session-info">
        <div class="session-details">
          <span class="session-code-label">Session Code:</span>
          <span class="session-code">{sessionCode}</span>
        </div>
        <div class="member-count">
          {participants.length} / {sessionData.maxSize} members
        </div>
      </div>

      <div class="participants-grid">
        {#each participants as participant}
          <div class="participant-card">
            <div class="participant-avatar">
              {getInitials(participant.name)}
            </div>
            <div class="participant-info">
              <h3 class="participant-name">{participant.name}</h3>
              <div class="connection-status">
                {formatConnectionStatus(participant)}
              </div>
              {#if participant.lastfmUsername}
                <div class="service-info">
                  <img src={lastfmIcon} alt="Last.fm" class="service-icon" />
                  <span class="service-username"
                    >{participant.lastfmUsername}</span
                  >
                </div>
              {/if}
              {#if participant.spotifyId}
                <div class="service-info">
                  <img src={spotifyIcon} alt="Spotify" class="service-icon" />
                  <span class="service-username">Spotify Connected</span>
                </div>
              {/if}
            </div>
          </div>
        {/each}

        <!-- Add empty slots to show remaining capacity (only show if less than 2 participants) -->
        {#if participants.length < 2}
          {#each Array(sessionData.maxSize - participants.length) as _, i}
            <div class="participant-card empty">
              <div class="participant-avatar empty">?</div>
              <div class="participant-info">
                <h3 class="participant-name">Waiting for user...</h3>
                <div class="connection-status empty">
                  Share the session code
                </div>
              </div>
            </div>
          {/each}
        {/if}
      </div>

      <div class="session-actions">
        <button class="share-button" on:click={shareSessionCode}>
          Share Session Code
        </button>

        {#if hasExistingMatches}
          <button class="view-matches-button" on:click={viewMatches}>
            View Matches
          </button>
          <button
            class="rerun-button"
            disabled={participants.length < 2 || isMatching}
            on:click={startMatching}
          >
            {isMatching ? "Re-running..." : "Re-run Matches"}
          </button>
        {:else}
          <button
            class="start-button"
            disabled={participants.length < 2 || isMatching}
            on:click={startMatching}
          >
            {isMatching ? "Processing..." : "Start Matching"}
          </button>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Modal for copy feedback -->
  {#if showModal}
    <div class="modal {modalType}">
      {modalMessage}
    </div>
  {/if}
</main>

<style>
  main {
    min-height: 100vh;
    background: linear-gradient(135deg, #ffff60 0%, #f0f048 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 2rem;
    position: relative;
    overflow-y: auto;
  }

  .participants-container {
    background-color: #e8e8d0;
    border: 3px solid #000;
    border-radius: 15px;
    padding: 2rem;
    width: 90%;
    max-width: 1000px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    margin-top: 4rem;
  }

  .menu-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
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

  .session-title {
    font-size: 28pt;
    font-weight: 400;
    color: #000;
    margin: 0;
    font-family: "Instrument Serif", serif;
  }

  .session-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1rem;
    background-color: #f5f5f5;
    border: 2px solid #000;
    border-radius: 8px;
  }

  .session-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .session-code-label {
    font-size: 14pt;
    color: #666;
  }

  .session-code {
    font-size: 20pt;
    font-weight: bold;
    color: #000;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .member-count {
    font-size: 18pt;
    font-weight: bold;
    color: #000;
  }

  .participants-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;
    animation: fadeInGrid 0.6s ease-out;
  }

  @keyframes fadeInGrid {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .participant-card {
    background-color: #f5f5f5;
    border: 3px solid #000;
    border-radius: 15px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    animation: fadeInCard 0.6s ease-out;
  }

  @keyframes fadeInCard {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .participant-card:hover:not(.empty) {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }

  .participant-card.empty {
    background-color: #e8e8e8;
    border-style: dashed;
    border-color: #999;
    opacity: 0.7;
  }

  .participant-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: #c8a2c8;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24pt;
    font-weight: bold;
    color: #000;
    border: 2px solid #000;
    flex-shrink: 0;
  }

  .participant-avatar.empty {
    background-color: #d0d0d0;
    color: #888;
  }

  .participant-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .participant-name {
    font-size: 18pt;
    font-weight: bold;
    color: #000;
    margin: 0;
    font-family: "Instrument Serif", serif;
  }

  .connection-status {
    font-size: 14pt;
    color: #666;
    font-weight: normal;
  }

  .connection-status.empty {
    font-style: italic;
  }

  .service-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 12pt;
    color: #555;
  }

  .service-icon {
    width: 16px;
    height: 16px;
  }

  .service-username {
    font-family: monospace;
  }

  .session-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .share-button,
  .start-button,
  .view-matches-button,
  .rerun-button {
    font-family: "Instrument Serif", serif;
    font-size: 18pt;
    padding: 1rem 2rem;
    border: 2px solid #000;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .share-button {
    background-color: #d0d0b8;
    color: #000;
  }

  .share-button:hover {
    background-color: #b8b8a0;
    transform: translateY(-1px);
  }

  .start-button {
    background-color: #a8d8a8;
    color: #000;
  }

  .start-button:hover:not(:disabled) {
    background-color: #90c090;
    transform: translateY(-1px);
  }

  .start-button:disabled {
    background-color: #e0e0e0;
    color: #999;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .view-matches-button {
    background-color: #4ade80;
    color: #000;
    font-weight: bold;
  }

  .view-matches-button:hover {
    background-color: #22c55e;
    transform: translateY(-1px);
  }

  .rerun-button {
    background-color: #fbbf24;
    color: #000;
  }

  .rerun-button:hover:not(:disabled) {
    background-color: #f59e0b;
    transform: translateY(-1px);
  }

  .rerun-button:disabled {
    background-color: #e0e0e0;
    color: #999;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .loading {
    text-align: center;
    font-size: 20pt;
    color: #666;
    padding: 3rem;
  }

  .error-message {
    background-color: #ffe6e6;
    border: 2px solid #ff4444;
    border-radius: 8px;
    color: #cc0000;
    padding: 1rem;
    text-align: center;
    font-size: 16pt;
    margin: 2rem 0;
  }

  /* Responsive design */
  @media (min-width: 481px) and (max-width: 768px) {
    .participants-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 769px) {
    .participants-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (min-width: 1200px) {
    .participants-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  @media (max-width: 480px) {
    .participants-container {
      padding: 1rem;
      width: 95%;
      margin-top: 2rem;
    }

    .session-title {
      font-size: 18pt;
    }

    .participants-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .participant-card {
      padding: 1rem;
    }

    .session-info {
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
    }

    .session-actions {
      flex-direction: column;
    }

    .share-button,
    .start-button,
    .view-matches-button,
    .rerun-button {
      font-size: 14pt;
      padding: 0.8rem 1.5rem;
    }
  }

  @media (min-width: 481px) and (max-width: 768px) {
    .participants-container {
      padding: 1.5rem;
      width: 95%;
      margin-top: 3rem;
    }

    .session-title {
      font-size: 22pt;
    }

    .session-info {
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
    }

    .session-actions {
      flex-direction: column;
    }

    .share-button,
    .start-button {
      font-size: 16pt;
      padding: 0.8rem 1.5rem;
    }
  }

  .participant-avatar {
    width: 50px;
    height: 50px;
    font-size: 20pt;
  }

  .participant-name {
    font-size: 16pt;
  }

  .share-button,
  .start-button {
    font-size: 14pt;
    padding: 0.6rem 1rem;
  }

  .modal {
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #f5f5f5;
    border: 3px solid #000;
    border-radius: 12px;
    padding: 1.5rem 2rem;
    font-size: 16pt;
    font-family: "Instrument Serif", serif;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    animation: slideInOut 5s ease-in-out;
    max-width: 300px;
    transform: translateX(100%);
  }

  .modal.success {
    background-color: #e6ffe6;
    border-color: #44aa44;
    color: #006600;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .modal.success::before {
    content: "✓";
    display: inline-block;
    width: 24px;
    height: 24px;
    background-color: #44aa44;
    color: white;
    border-radius: 50%;
    text-align: center;
    line-height: 24px;
    font-weight: bold;
    animation: checkmarkPop 0.6s ease-out;
    flex-shrink: 0;
  }

  @keyframes checkmarkPop {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .modal.error {
    background-color: #ffe6e6;
    border-color: #aa4444;
    color: #cc0000;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .modal.error::before {
    content: "⚠";
    display: inline-block;
    width: 24px;
    height: 24px;
    background-color: #aa4444;
    color: white;
    border-radius: 50%;
    text-align: center;
    line-height: 24px;
    font-weight: bold;
    flex-shrink: 0;
  }

  @keyframes slideInOut {
    0% {
      opacity: 0;
      transform: translateX(100%);
    }
    10%,
    90% {
      opacity: 1;
      transform: translateX(0);
    }
    100% {
      opacity: 0;
      transform: translateX(100%);
    }
  }
</style>
