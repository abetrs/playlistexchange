<script>
  import BrandContainer from "../lib/BrandContainer.svelte";
  import { onMount } from "svelte";
  import { API_ENDPOINTS } from "../config.js";

  export let params = {};

  let sessionCode = "";
  let matchData = null;
  let isLoading = true;
  let errorMessage = "";
  let showModal = false;
  let modalMessage = "";
  let modalType = "success";
  let isRerunning = false;

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
      await loadMatchData();
    } else {
      errorMessage = "No session code provided";
      isLoading = false;
    }
  });

  async function loadMatchData() {
    try {
      const response = await fetch(
        API_ENDPOINTS.GET_SESSION_MATCHES(sessionCode)
      );

      if (!response.ok) {
        if (response.status === 404) {
          errorMessage = "Session not found";
        } else {
          errorMessage = "Failed to load match data";
        }
        return;
      }

      matchData = await response.json();
      console.log("Match data received:", matchData); // Debug log
      console.log("Has matches flag:", matchData.hasMatches); // Debug log
      console.log("Matches array:", matchData.matches); // Debug log
      console.log("Matches length:", matchData.matches?.length); // Debug log

      if (
        !matchData.hasMatches &&
        (!matchData.matches || matchData.matches.length === 0)
      ) {
        errorMessage = "No matches available. Please run matching first.";
      }
    } catch (error) {
      console.error("Error loading match data:", error);
      errorMessage = "Failed to load match data";
    } finally {
      isLoading = false;
    }
  }

  function goBack() {
    window.navigate(`/participants/${sessionCode}`);
  }

  function getInitials(name) {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }

  function getCompatibilityColor(score) {
    if (score >= 0.8) return "#4ade80"; // Green
    if (score >= 0.5) return "#fbbf24"; // Yellow
    return "#f87171"; // Red
  }

  function getCompatibilityDescription(score) {
    if (score >= 0.9) return "Exceptional Match";
    if (score >= 0.8) return "Great Match";
    if (score >= 0.7) return "Good Match";
    if (score >= 0.5) return "Fair Match";
    if (score >= 0.3) return "Some Compatibility";
    return "Limited Compatibility";
  }

  function formatPercentage(score) {
    return Math.round(score * 100);
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

  async function rerunMatching() {
    if (isRerunning) return;

    isRerunning = true;
    showSuccessModal("Re-running matches...");

    try {
      // First, build taste profiles for all participants
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

      showSuccessModal("Matches updated successfully!");

      // Reload the match data
      await loadMatchData();
    } catch (error) {
      console.error("Error rerunning matches:", error);
      showErrorModal(`Failed to rerun matches: ${error.message}`);
    } finally {
      isRerunning = false;
    }
  }
</script>

<main>
  <div class="brand-wrapper">
    <BrandContainer />
  </div>

  <div class="results-container">
    <div class="menu-header">
      <button class="back-button" on:click={goBack}>← Back to Session</button>
      {#if matchData?.sessionInfo}
        <h1 class="session-title">Matches for {matchData.sessionInfo.name}</h1>
      {/if}
    </div>

    {#if isLoading}
      <div class="loading">Loading match results...</div>
    {:else if errorMessage}
      <div class="error-message">
        {errorMessage}
        <button class="back-button secondary" on:click={goBack}>Go Back</button>
      </div>
    {:else if matchData && ((matchData.hasMatches && matchData.matches) || (matchData.matches && matchData.matches.length > 0))}
      <div class="session-info">
        <div class="session-details">
          <span class="session-code-label">Session Code:</span>
          <span class="session-code">{sessionCode}</span>
        </div>
        <div class="match-info">
          {matchData.matches.length} compatibility {matchData.matches.length ===
          1
            ? "match"
            : "matches"} found
        </div>
      </div>

      <div class="matches-grid">
        {#each matchData.matches as match, index}
          <div class="match-card">
            <div class="match-header">
              <div class="match-rank">#{index + 1}</div>
              <div
                class="compatibility-score"
                style="color: {getCompatibilityColor(match.score)}"
              >
                {formatPercentage(match.score)}%
              </div>
            </div>

            <div class="match-participants">
              <div class="participant">
                <div class="participant-avatar">
                  {getInitials(match.userA.name)}
                </div>
                <div class="participant-name">{match.userA.name}</div>
              </div>

              <div class="match-connector">
                <div class="compatibility-bar">
                  <div
                    class="compatibility-fill"
                    style="width: {formatPercentage(
                      match.score
                    )}%; background-color: {getCompatibilityColor(match.score)}"
                  ></div>
                </div>
                <div class="compatibility-description">
                  {getCompatibilityDescription(match.score)}
                </div>
              </div>

              <div class="participant">
                <div class="participant-avatar">
                  {getInitials(match.userB.name)}
                </div>
                <div class="participant-name">{match.userB.name}</div>
              </div>
            </div>

            {#if match.details}
              <div class="match-details">
                <div class="detail-section">
                  <h4>Compatibility Breakdown</h4>
                  <div class="detail-item">
                    <span>Artist Similarity:</span>
                    <span>{formatPercentage(match.details.artistScore)}%</span>
                  </div>
                  <div class="detail-item">
                    <span>Track Similarity:</span>
                    <span>{formatPercentage(match.details.trackScore)}%</span>
                  </div>
                  <div class="detail-item">
                    <span>Common Artists:</span>
                    <span>{match.details.commonArtists}</span>
                  </div>
                  <div class="detail-item">
                    <span>Common Tracks:</span>
                    <span>{match.details.commonTracks}</span>
                  </div>
                </div>

                {#if match.details.topCommonArtists && match.details.topCommonArtists.length > 0}
                  <div class="detail-section">
                    <h4>Top Common Artists</h4>
                    <div class="common-items">
                      {#each match.details.topCommonArtists as artist}
                        <span class="common-item">{artist}</span>
                      {/each}
                    </div>
                  </div>
                {/if}

                {#if match.details.topCommonTracks && match.details.topCommonTracks.length > 0}
                  <div class="detail-section">
                    <h4>Top Common Tracks</h4>
                    <div class="common-items">
                      {#each match.details.topCommonTracks as track}
                        <span class="common-item">{track}</span>
                      {/each}
                    </div>
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        {/each}
      </div>

      <div class="results-actions">
        <button
          class="rerun-button"
          disabled={isRerunning}
          on:click={rerunMatching}
        >
          {isRerunning ? "Re-running..." : "Re-run Matches"}
        </button>
      </div>

      {#if matchData.errors && matchData.errors.length > 0}
        <div class="errors-section">
          <h3>Profile Errors</h3>
          <div class="error-list">
            {#each matchData.errors as error}
              <div class="error-item">
                User {error.userCode}: {error.error}
              </div>
            {/each}
          </div>
        </div>
      {/if}
    {:else}
      <div class="no-matches">
        <h2>No matches found</h2>
        <p>
          This could happen if participants don't have enough music data or
          profiles couldn't be built.
        </p>
        <button class="back-button secondary" on:click={goBack}>Go Back</button>
      </div>
    {/if}
  </div>

  <!-- Modal for feedback -->
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
    font-family: "Instrument Serif", serif;
  }

  .brand-wrapper {
    display: flex;
    justify-content: center;
    padding: 2rem 0 1rem 0;
  }

  .results-container {
    flex: 1;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .menu-header {
    display: flex;
    align-items: center;
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .back-button {
    background: #e8e8d0;
    border: 2px solid #000;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    font-family: "Instrument Serif", serif;
    font-size: 16pt;
    transition: all 0.2s ease;
  }

  .back-button:hover {
    background: #ddd;
    transform: translateY(-2px);
  }

  .back-button.secondary {
    background: #f5f5f5;
  }

  .session-title {
    font-size: 24pt;
    margin: 0;
    color: #000;
  }

  .loading,
  .error-message,
  .no-matches {
    text-align: center;
    padding: 3rem;
    background: #e8e8d0;
    border: 2px solid #000;
    border-radius: 15px;
    margin: 2rem 0;
  }

  .error-message,
  .no-matches {
    font-size: 18pt;
  }

  .session-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #e8e8d0;
    border: 2px solid #000;
    border-radius: 20px;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .session-details {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .session-code-label {
    font-size: 16pt;
    color: #666;
  }

  .session-code {
    font-size: 20pt;
    font-weight: bold;
    background: #fff;
    padding: 0.5rem 1rem;
    border: 2px solid #000;
    border-radius: 8px;
  }

  .match-info {
    font-size: 16pt;
    color: #333;
  }

  .matches-grid {
    display: grid;
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .match-card {
    background: #e8e8d0;
    border: 2px solid #000;
    border-radius: 20px;
    padding: 2rem;
    transition: transform 0.2s ease;
  }

  .match-card:hover {
    transform: translateY(-2px);
  }

  .match-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .match-rank {
    background: #000;
    color: #fff;
    padding: 0.5rem 1rem;
    border-radius: 15px;
    font-size: 16pt;
    font-weight: bold;
  }

  .compatibility-score {
    font-size: 24pt;
    font-weight: bold;
  }

  .match-participants {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .participant {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .participant-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid #000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18pt;
    font-weight: bold;
  }

  .participant-name {
    font-size: 16pt;
    font-weight: bold;
    text-align: center;
  }

  .match-connector {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .compatibility-bar {
    width: 150px;
    height: 20px;
    background: #ddd;
    border: 2px solid #000;
    border-radius: 10px;
    overflow: hidden;
  }

  .compatibility-fill {
    height: 100%;
    transition: width 0.3s ease;
  }

  .compatibility-description {
    font-size: 14pt;
    font-weight: bold;
    text-align: center;
  }

  .match-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    padding-top: 1.5rem;
    border-top: 2px solid #000;
  }

  .detail-section h4 {
    font-size: 16pt;
    margin: 0 0 1rem 0;
    color: #333;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid #ccc;
  }

  .detail-item:last-child {
    border-bottom: none;
  }

  .common-items {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .common-item {
    background: #fff;
    border: 1px solid #000;
    border-radius: 20px;
    padding: 0.25rem 0.75rem;
    font-size: 12pt;
  }

  .results-actions {
    display: flex;
    justify-content: center;
    margin: 2rem 0;
  }

  .rerun-button {
    background: #4ade80;
    border: 2px solid #000;
    padding: 1rem 2rem;
    border-radius: 8px;
    cursor: pointer;
    font-family: "Instrument Serif", serif;
    font-size: 18pt;
    font-weight: bold;
    color: #000;
    transition: all 0.2s ease;
  }

  .rerun-button:hover:not(:disabled) {
    background: #22c55e;
    transform: translateY(-2px);
  }

  .rerun-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .errors-section {
    background: #fee2e2;
    border: 2px solid #dc2626;
    border-radius: 15px;
    padding: 1.5rem;
    margin-top: 2rem;
  }

  .errors-section h3 {
    margin: 0 0 1rem 0;
    color: #dc2626;
  }

  .error-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .error-item {
    background: #fff;
    border: 1px solid #dc2626;
    border-radius: 8px;
    padding: 0.75rem;
    color: #dc2626;
  }

  .modal {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 2rem;
    border-radius: 8px;
    border: 2px solid #000;
    font-weight: bold;
    z-index: 1000;
    animation: slideIn 0.3s ease;
  }

  .modal.success {
    background: #d1fae5;
    color: #065f46;
  }

  .modal.error {
    background: #fee2e2;
    color: #991b1b;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .results-container {
      padding: 1rem;
    }

    .menu-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .session-title {
      font-size: 20pt;
    }

    .session-info {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .match-participants {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .match-connector {
      order: 3;
    }

    .compatibility-bar {
      width: 200px;
    }

    .match-details {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 480px) {
    .session-title,
    .compatibility-score {
      font-size: 18pt;
    }

    .participant-avatar {
      width: 50px;
      height: 50px;
      font-size: 14pt;
    }

    .compatibility-bar {
      width: 150px;
    }
  }
</style>
