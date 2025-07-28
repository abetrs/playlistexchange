<script>
  import BrandContainer from "../lib/BrandContainer.svelte";
  import { onMount } from "svelte";
  import { API_ENDPOINTS } from "../config.js";

  export let params = {};

  let sessionCode = "";
  let sessionData = null;
  let matches = [];
  let isLoading = true;
  let errorMessage = "";
  let showModal = false;
  let modalMessage = "";
  let modalType = "success";

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
      await loadResults();
    } else {
      errorMessage = "No session code provided";
      isLoading = false;
    }
  });

  async function loadResults() {
    try {
      // Fetch session matches
      const matchesResponse = await fetch(
        API_ENDPOINTS.GET_SESSION_MATCHES(sessionCode)
      );

      if (!matchesResponse.ok) {
        const errorData = await matchesResponse.json();
        throw new Error(errorData.message || "Failed to load matches");
      }

      const matchesData = await matchesResponse.json();
      sessionData = matchesData.sessionInfo;
      matches = matchesData.matches || [];

      if (matches.length === 0) {
        errorMessage =
          "No matches found. Make sure all participants have Last.fm profiles.";
      }
    } catch (error) {
      console.error("Error loading results:", error);
      errorMessage = error.message || "Failed to load matching results";
    } finally {
      isLoading = false;
    }
  }

  function goBack() {
    window.navigate(`/participants/${sessionCode}`);
  }

  function goHome() {
    window.navigate("/");
  }

  function getScoreColor(score) {
    if (score >= 0.7) return "#4CAF50"; // Green for high compatibility
    if (score >= 0.4) return "#FF9800"; // Orange for medium compatibility
    return "#F44336"; // Red for low compatibility
  }

  function getScoreLabel(score) {
    if (score >= 0.7) return "Excellent Match";
    if (score >= 0.4) return "Good Match";
    return "Different Tastes";
  }

  function formatScore(score) {
    return Math.round(score * 100);
  }

  function getInitials(name) {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }

  function showSuccessModal(message) {
    modalMessage = message;
    modalType = "success";
    showModal = true;
    setTimeout(() => {
      showModal = false;
    }, 3000);
  }

  async function shareResults() {
    const resultsUrl = `${window.location.origin}/results/${sessionCode}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(resultsUrl);
        showSuccessModal("Results link copied to clipboard!");
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = resultsUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        showSuccessModal("Results link copied to clipboard!");
      }
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  }
</script>

<main>
  <BrandContainer />

  <div class="results-container">
    <div class="menu-header">
      <button class="back-button" on:click={goBack}>← Back to Session</button>
      {#if sessionData}
        <h1 class="session-title">{sessionData.name} - Results</h1>
      {/if}
    </div>

    {#if isLoading}
      <div class="loading">Loading matching results...</div>
    {:else if errorMessage}
      <div class="error-message">
        {errorMessage}
        <div class="error-actions">
          <button class="retry-button" on:click={loadResults}>Retry</button>
          <button class="home-button" on:click={goHome}>Go Home</button>
        </div>
      </div>
    {:else if sessionData}
      <div class="session-info">
        <div class="session-details">
          <span class="session-code-label">Session:</span>
          <span class="session-code">{sessionCode}</span>
        </div>
        <div class="results-stats">
          {matches.length} compatibility {matches.length === 1
            ? "match"
            : "matches"} found
        </div>
      </div>

      {#if matches.length > 0}
        <div class="matches-grid">
          {#each matches as match, index}
            <div class="match-card">
              <div class="match-header">
                <div class="match-rank">#{index + 1}</div>
                <div
                  class="compatibility-score"
                  style="color: {getScoreColor(match.score)}"
                >
                  {formatScore(match.score)}%
                </div>
              </div>

              <div class="users-container">
                <div class="user-info">
                  <div class="user-avatar">
                    {getInitials(match.userA.name)}
                  </div>
                  <div class="user-name">{match.userA.name}</div>
                </div>

                <div class="match-connector">
                  <div class="match-line"></div>
                  <div class="match-heart">💕</div>
                  <div class="match-line"></div>
                </div>

                <div class="user-info">
                  <div class="user-avatar">
                    {getInitials(match.userB.name)}
                  </div>
                  <div class="user-name">{match.userB.name}</div>
                </div>
              </div>

              <div class="match-details">
                <div class="score-label">
                  {getScoreLabel(match.score)}
                </div>

                {#if match.details.topCommonArtists?.length > 0}
                  <div class="common-elements">
                    <div class="common-title">Shared Artists:</div>
                    <div class="common-list">
                      {match.details.topCommonArtists.slice(0, 3).join(", ")}
                      {#if match.details.commonArtists > 3}
                        <span class="more-count"
                          >+{match.details.commonArtists - 3} more</span
                        >
                      {/if}
                    </div>
                  </div>
                {/if}

                <div class="detailed-scores">
                  <div class="score-item">
                    <span class="score-type">Artists:</span>
                    <span class="score-value"
                      >{formatScore(match.details.artistScore)}%</span
                    >
                  </div>
                  <div class="score-item">
                    <span class="score-type">Tracks:</span>
                    <span class="score-value"
                      >{formatScore(match.details.trackScore)}%</span
                    >
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>

        <div class="results-actions">
          <button class="share-button" on:click={shareResults}>
            Share Results
          </button>
          <button class="new-session-button" on:click={goHome}>
            Start New Session
          </button>
        </div>
      {:else}
        <div class="no-matches">
          <h2>No Matches Found</h2>
          <p>
            Try adding more participants with Last.fm profiles, or check back
            later.
          </p>
          <button class="retry-button" on:click={goBack}>Back to Session</button
          >
        </div>
      {/if}
    {/if}
  </div>

  <!-- Modal for share feedback -->
  {#if showModal}
    <div class="modal {modalType}">
      {modalMessage}
    </div>
  {/if}

  <div class="attribution">By ReallyAbe</div>
</main>

<style>
  main {
    min-height: 100vh;
    background-color: #ffff60;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 2rem;
    position: relative;
    overflow-y: auto;
  }

  .attribution {
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 20pt;
    color: #000;
    font-family: Helvetica, Arial, sans-serif;
    font-weight: 400;
  }

  .results-container {
    background-color: #e8e8d0;
    border: 3px solid #000;
    border-radius: 15px;
    padding: 2rem;
    width: 90%;
    max-width: 1200px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    margin-top: 4rem;
  }

  .menu-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
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
    flex-wrap: wrap;
    gap: 1rem;
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

  .results-stats {
    font-size: 18pt;
    font-weight: bold;
    color: #000;
  }

  .matches-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .match-card {
    background-color: #f9f9f9;
    border: 2px solid #000;
    border-radius: 12px;
    padding: 1.5rem;
    transition: all 0.2s ease;
  }

  .match-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }

  .match-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .match-rank {
    font-size: 16pt;
    font-weight: bold;
    color: #666;
    background-color: #e0e0e0;
    padding: 0.25rem 0.75rem;
    border-radius: 15px;
  }

  .compatibility-score {
    font-size: 24pt;
    font-weight: bold;
  }

  .users-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
  }

  .user-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #c8a2c8;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18pt;
    font-weight: bold;
    color: #000;
    border: 2px solid #000;
  }

  .user-name {
    font-size: 14pt;
    font-weight: bold;
    color: #000;
    text-align: center;
    font-family: "Instrument Serif", serif;
  }

  .match-connector {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 0 0 auto;
  }

  .match-line {
    width: 20px;
    height: 2px;
    background-color: #ff6b9d;
  }

  .match-heart {
    font-size: 18pt;
  }

  .match-details {
    border-top: 1px solid #ddd;
    padding-top: 1rem;
  }

  .score-label {
    font-size: 16pt;
    font-weight: bold;
    color: #333;
    text-align: center;
    margin-bottom: 0.75rem;
  }

  .common-elements {
    margin-bottom: 0.75rem;
  }

  .common-title {
    font-size: 12pt;
    font-weight: bold;
    color: #666;
    margin-bottom: 0.25rem;
  }

  .common-list {
    font-size: 11pt;
    color: #555;
    line-height: 1.3;
  }

  .more-count {
    color: #888;
    font-style: italic;
  }

  .detailed-scores {
    display: flex;
    justify-content: space-around;
    gap: 1rem;
  }

  .score-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .score-type {
    font-size: 11pt;
    color: #666;
  }

  .score-value {
    font-size: 14pt;
    font-weight: bold;
    color: #333;
  }

  .results-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .share-button,
  .new-session-button,
  .retry-button,
  .home-button {
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

  .new-session-button {
    background-color: #a8d8a8;
    color: #000;
  }

  .new-session-button:hover {
    background-color: #90c090;
    transform: translateY(-1px);
  }

  .retry-button {
    background-color: #ffd88a;
    color: #000;
  }

  .retry-button:hover {
    background-color: #ffcc70;
    transform: translateY(-1px);
  }

  .home-button {
    background-color: #ffb3b3;
    color: #000;
  }

  .home-button:hover {
    background-color: #ff9999;
    transform: translateY(-1px);
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
    padding: 1.5rem;
    text-align: center;
    font-size: 16pt;
    margin: 2rem 0;
  }

  .error-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1rem;
    flex-wrap: wrap;
  }

  .no-matches {
    text-align: center;
    padding: 3rem;
  }

  .no-matches h2 {
    font-size: 24pt;
    color: #333;
    margin-bottom: 1rem;
    font-family: "Instrument Serif", serif;
  }

  .no-matches p {
    font-size: 16pt;
    color: #666;
    margin-bottom: 2rem;
    line-height: 1.4;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .attribution {
      font-size: 16pt;
    }

    .results-container {
      padding: 1.5rem;
      width: 95%;
      margin-top: 3rem;
    }

    .session-title {
      font-size: 22pt;
    }

    .matches-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .session-info {
      flex-direction: column;
      align-items: stretch;
    }

    .results-actions {
      flex-direction: column;
    }

    .share-button,
    .new-session-button {
      font-size: 16pt;
      padding: 0.8rem 1.5rem;
    }
  }

  @media (max-width: 480px) {
    .results-container {
      padding: 1rem;
    }

    .session-title {
      font-size: 18pt;
    }

    .match-card {
      padding: 1rem;
    }

    .compatibility-score {
      font-size: 20pt;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      font-size: 16pt;
    }

    .user-name {
      font-size: 12pt;
    }

    .share-button,
    .new-session-button {
      font-size: 14pt;
      padding: 0.6rem 1rem;
    }
  }

  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #f5f5f5;
    border: 2px solid #000;
    border-radius: 8px;
    padding: 1rem 1.5rem;
    font-size: 16pt;
    font-family: "Instrument Serif", serif;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    animation: fadeInOut 3s ease-in-out;
  }

  .modal.success {
    background-color: #e6ffe6;
    border-color: #44aa44;
    color: #006600;
  }

  .modal.error {
    background-color: #ffe6e6;
    border-color: #aa4444;
    color: #cc0000;
  }

  @keyframes fadeInOut {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.9);
    }
    10%,
    90% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.9);
    }
  }
</style>
