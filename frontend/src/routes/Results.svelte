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
  let currentUserCode = null;
  let participantDetails = new Map(); // Store detailed user info for each participant
  let showPlaylistModal = false;
  let playlistModalData = null;
  let playlistInputs = new Map(); // Store playlist inputs for current user
  let isUpdatingPlaylist = false;

  onMount(async () => {
    // Get current user from localStorage
    try {
      const storedSession = localStorage.getItem("lastJoinedSession");
      if (storedSession) {
        const sessionInfo = JSON.parse(storedSession);
        if (sessionInfo.userCode) {
          currentUserCode = sessionInfo.userCode;
        }
      }
    } catch (error) {
      console.error("Error parsing stored session:", error);
    }

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
      await loadParticipantDetails();
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
      await loadParticipantDetails();
    } catch (error) {
      console.error("Error rerunning matches:", error);
      showErrorModal(`Failed to rerun matches: ${error.message}`);
    } finally {
      isRerunning = false;
    }
  }

  async function loadParticipantDetails() {
    if (!matchData?.matches) return;

    const userCodes = new Set();

    // Collect all unique user codes from matches
    matchData.matches.forEach((match) => {
      userCodes.add(match.userA.code);
      userCodes.add(match.userB.code);
    });

    // Fetch detailed user information for each participant
    for (const userCode of userCodes) {
      try {
        const response = await fetch(API_ENDPOINTS.USER_BY_CODE(userCode));
        if (response.ok) {
          const userData = await response.json();
          participantDetails.set(userCode, userData.user);
        }
      } catch (error) {
        console.error(`Error loading details for user ${userCode}:`, error);
      }
    }

    // Trigger reactivity
    participantDetails = new Map(participantDetails);
  }

  async function updateUserPlaylist(userCode, playlistName, playlistUrl) {
    if (isUpdatingPlaylist) return;

    isUpdatingPlaylist = true;

    try {
      const response = await fetch(API_ENDPOINTS.UPDATE_USER(userCode), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playlist: {
            name: playlistName.trim(),
            url: playlistUrl.trim(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update playlist");
      }

      const updatedUser = await response.json();
      participantDetails.set(userCode, updatedUser.user);
      participantDetails = new Map(participantDetails);

      // Clear the input for this user
      playlistInputs.delete(userCode);
      playlistInputs = new Map(playlistInputs);

      showSuccessModal("Playlist linked successfully!");

      // Auto refresh after 2 seconds to show updated playlist state
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error updating playlist:", error);
      showErrorModal("Failed to link playlist");
    } finally {
      isUpdatingPlaylist = false;
    }
  }

  function handlePlaylistSubmit(userCode, event) {
    event.preventDefault();
    const input = playlistInputs.get(userCode);
    if (input?.name && input?.url) {
      updateUserPlaylist(userCode, input.name, input.url);
    }
  }

  function updatePlaylistInput(userCode, field, value) {
    const currentInput = playlistInputs.get(userCode) || { name: "", url: "" };
    currentInput[field] = value;
    playlistInputs.set(userCode, currentInput);
    playlistInputs = new Map(playlistInputs);
  }

  function showPlaylistModalFunction(playlist) {
    playlistModalData = playlist;
    showPlaylistModal = true;
  }

  function closePlaylistModal() {
    showPlaylistModal = false;
    playlistModalData = null;
  }

  function openPlaylist(url) {
    window.open(url, "_blank");
  }

  function getPlaylistSection(userCode, userName) {
    const userDetails = participantDetails.get(userCode);
    const isCurrentUser = userCode === currentUserCode;

    if (isCurrentUser) {
      // Show input form for current user
      if (userDetails?.playlist?.name && userDetails?.playlist?.url) {
        // User has already linked a playlist
        return {
          type: "linked",
          playlist: userDetails.playlist,
        };
      } else {
        // Show input form
        return {
          type: "input",
          input: playlistInputs.get(userCode) || { name: "", url: "" },
        };
      }
    } else {
      // Show playlist info for other users
      if (userDetails?.playlist?.name && userDetails?.playlist?.url) {
        return {
          type: "view",
          playlist: userDetails.playlist,
        };
      } else {
        return {
          type: "waiting",
        };
      }
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

                <!-- Playlist Section for User A -->
                {#if participantDetails.has(match.userA.code)}
                  {@const playlistSection = getPlaylistSection(
                    match.userA.code,
                    match.userA.name
                  )}
                  <div class="playlist-section">
                    {#if playlistSection.type === "input"}
                      <form
                        class="playlist-form"
                        on:submit={(e) =>
                          handlePlaylistSubmit(match.userA.code, e)}
                      >
                        <input
                          type="text"
                          placeholder="Playlist name"
                          class="playlist-input"
                          bind:value={playlistSection.input.name}
                          on:input={(e) =>
                            updatePlaylistInput(
                              match.userA.code,
                              "name",
                              e.target.value
                            )}
                          required
                        />
                        <input
                          type="url"
                          placeholder="Playlist URL"
                          class="playlist-input"
                          bind:value={playlistSection.input.url}
                          on:input={(e) =>
                            updatePlaylistInput(
                              match.userA.code,
                              "url",
                              e.target.value
                            )}
                          required
                        />
                        <button
                          type="submit"
                          class="playlist-submit"
                          disabled={isUpdatingPlaylist}
                        >
                          {isUpdatingPlaylist ? "Linking..." : "Link Playlist"}
                        </button>
                      </form>
                    {:else if playlistSection.type === "linked"}
                      <div class="playlist-linked">
                        <button
                          class="playlist-button"
                          on:click={() =>
                            showPlaylistModalFunction(playlistSection.playlist)}
                        >
                          🎵 {playlistSection.playlist.name}
                        </button>
                      </div>
                    {:else if playlistSection.type === "view"}
                      <div class="playlist-view">
                        <button
                          class="playlist-button"
                          on:click={() =>
                            showPlaylistModalFunction(playlistSection.playlist)}
                        >
                          🎵 {playlistSection.playlist.name}
                        </button>
                      </div>
                    {:else}
                      <div class="playlist-waiting">
                        Waiting for playlist...
                      </div>
                    {/if}
                  </div>
                {/if}
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

                <!-- Playlist Section for User B -->
                {#if participantDetails.has(match.userB.code)}
                  {@const playlistSection = getPlaylistSection(
                    match.userB.code,
                    match.userB.name
                  )}
                  <div class="playlist-section">
                    {#if playlistSection.type === "input"}
                      <form
                        class="playlist-form"
                        on:submit={(e) =>
                          handlePlaylistSubmit(match.userB.code, e)}
                      >
                        <input
                          type="text"
                          placeholder="Playlist name"
                          class="playlist-input"
                          bind:value={playlistSection.input.name}
                          on:input={(e) =>
                            updatePlaylistInput(
                              match.userB.code,
                              "name",
                              e.target.value
                            )}
                          required
                        />
                        <input
                          type="url"
                          placeholder="Playlist URL"
                          class="playlist-input"
                          bind:value={playlistSection.input.url}
                          on:input={(e) =>
                            updatePlaylistInput(
                              match.userB.code,
                              "url",
                              e.target.value
                            )}
                          required
                        />
                        <button
                          type="submit"
                          class="playlist-submit"
                          disabled={isUpdatingPlaylist}
                        >
                          {isUpdatingPlaylist ? "Linking..." : "Link Playlist"}
                        </button>
                      </form>
                    {:else if playlistSection.type === "linked"}
                      <div class="playlist-linked">
                        <button
                          class="playlist-button"
                          on:click={() =>
                            showPlaylistModalFunction(playlistSection.playlist)}
                        >
                          🎵 {playlistSection.playlist.name}
                        </button>
                      </div>
                    {:else if playlistSection.type === "view"}
                      <div class="playlist-view">
                        <button
                          class="playlist-button"
                          on:click={() =>
                            showPlaylistModalFunction(playlistSection.playlist)}
                        >
                          🎵 {playlistSection.playlist.name}
                        </button>
                      </div>
                    {:else}
                      <div class="playlist-waiting">
                        Waiting for playlist...
                      </div>
                    {/if}
                  </div>
                {/if}
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

  <!-- Playlist Modal -->
  {#if showPlaylistModal && playlistModalData}
    <div
      class="playlist-modal-backdrop"
      role="button"
      tabindex="0"
      on:click={closePlaylistModal}
      on:keydown={(e) => e.key === "Escape" && closePlaylistModal()}
    >
      <div
        class="playlist-modal"
        role="dialog"
        aria-labelledby="playlist-modal-title"
        on:click|stopPropagation
        on:keydown|stopPropagation
      >
        <div class="playlist-modal-header">
          <h3>🎵 {playlistModalData.name}</h3>
          <button class="close-button" on:click={closePlaylistModal}>×</button>
        </div>
        <div class="playlist-modal-content">
          <p>Click the button below to open this playlist:</p>
          <button
            class="open-playlist-button"
            on:click={() => openPlaylist(playlistModalData.url)}
          >
            Open Playlist
          </button>
          {#if playlistModalData.linkedAt}
            <p class="playlist-meta">
              Linked on {new Date(
                playlistModalData.linkedAt.seconds * 1000
              ).toLocaleDateString()}
            </p>
          {/if}
        </div>
      </div>
    </div>
  {/if}

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

  .playlist-section {
    margin-top: 1rem;
    width: 100%;
  }

  .playlist-form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .playlist-input {
    background: #fff;
    border: 2px solid #000;
    border-radius: 8px;
    padding: 0.5rem;
    font-family: "Instrument Serif", serif;
    font-size: 12pt;
  }

  .playlist-input:focus {
    outline: none;
    border-color: #4ade80;
  }

  .playlist-submit {
    background: #4ade80;
    border: 2px solid #000;
    border-radius: 8px;
    padding: 0.5rem;
    cursor: pointer;
    font-family: "Instrument Serif", serif;
    font-size: 12pt;
    font-weight: bold;
    transition: all 0.2s ease;
  }

  .playlist-submit:hover:not(:disabled) {
    background: #22c55e;
    transform: translateY(-1px);
  }

  .playlist-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .playlist-button {
    background: #e8e8d0;
    border: 2px solid #000;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-family: "Instrument Serif", serif;
    font-size: 12pt;
    font-weight: bold;
    transition: all 0.2s ease;
    width: 100%;
  }

  .playlist-button:hover {
    background: #ddd;
    transform: translateY(-1px);
  }

  .playlist-waiting {
    background: #f5f5f5;
    border: 2px dashed #ccc;
    border-radius: 8px;
    padding: 0.75rem;
    text-align: center;
    font-size: 12pt;
    color: #666;
    font-style: italic;
  }

  .playlist-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .playlist-modal {
    background: #e8e8d0;
    border: 3px solid #000;
    border-radius: 20px;
    padding: 2rem;
    max-width: 400px;
    width: 90%;
    position: relative;
  }

  .playlist-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .playlist-modal-header h3 {
    margin: 0;
    font-size: 18pt;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 24pt;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-button:hover {
    background: #ddd;
    border-radius: 50%;
  }

  .playlist-modal-content {
    text-align: center;
  }

  .playlist-modal-content p {
    margin: 1rem 0;
    font-size: 14pt;
  }

  .open-playlist-button {
    background: #4ade80;
    border: 2px solid #000;
    border-radius: 8px;
    padding: 1rem 2rem;
    cursor: pointer;
    font-family: "Instrument Serif", serif;
    font-size: 16pt;
    font-weight: bold;
    transition: all 0.2s ease;
  }

  .open-playlist-button:hover {
    background: #22c55e;
    transform: translateY(-2px);
  }

  .playlist-meta {
    font-size: 12pt !important;
    color: #666 !important;
    margin-top: 1rem !important;
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

    .playlist-modal {
      width: 95%;
      padding: 1.5rem;
    }

    .playlist-form {
      gap: 0.75rem;
    }

    .playlist-input {
      font-size: 14pt;
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

    .playlist-modal {
      padding: 1rem;
    }

    .playlist-modal-header h3 {
      font-size: 16pt;
    }

    .open-playlist-button {
      font-size: 14pt;
      padding: 0.75rem 1.5rem;
    }

    .playlist-input {
      font-size: 12pt;
      padding: 0.5rem;
    }

    .playlist-submit {
      font-size: 11pt;
    }
  }
</style>
