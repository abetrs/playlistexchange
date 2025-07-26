<script>
  // Home page component
  import BrandContainer from "../lib/BrandContainer.svelte";
  import ActionsMenu from "../lib/ActionsMenu.svelte";
  import { onMount } from "svelte";

  let joinCode = "";
  let lastJoinedSession = null;

  onMount(() => {
    // Check if there's a stored session to rejoin
    const storedSession = localStorage.getItem("lastJoinedSession");
    if (storedSession) {
      try {
        lastJoinedSession = JSON.parse(storedSession);
      } catch (error) {
        console.error("Error parsing stored session:", error);
        localStorage.removeItem("lastJoinedSession");
      }
    }
  });

  function handleJoin() {
    if (joinCode.trim()) {
      console.log("Joining with code:", joinCode);
      window.navigate(`/join/${joinCode}`);
    }
  }

  function handleCreate() {
    console.log("Creating new session");
    window.navigate("/create");
  }

  function handleRejoinSession() {
    if (lastJoinedSession) {
      window.navigate(`/participants/${lastJoinedSession.sessionCode}`);
    }
  }

  function dismissRejoinSession() {
    localStorage.removeItem("lastJoinedSession");
    lastJoinedSession = null;
  }
</script>

<main>
  <BrandContainer />

  {#if lastJoinedSession}
    <div class="rejoin-session">
      <div class="rejoin-container">
        <h3>Continue Previous Session</h3>
        <p>You were in: <strong>{lastJoinedSession.sessionName}</strong></p>
        <div class="rejoin-actions">
          <button class="rejoin-button" on:click={handleRejoinSession}>
            Join Session: {lastJoinedSession.sessionName}
          </button>
          <button class="dismiss-button" on:click={dismissRejoinSession}
            >×</button
          >
        </div>
      </div>
    </div>
  {/if}

  <ActionsMenu bind:joinCode onJoin={handleJoin} onCreate={handleCreate} />
  <div class="attribution">By ReallyAbe</div>
</main>

<style>
  main {
    min-height: 100vh;
    background-color: #ffff60;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    position: relative;
    overflow-y: auto;
    gap: 1.5rem;
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

  .rejoin-session {
    width: 100%;
    max-width: 500px;
    margin-bottom: 1rem;
  }

  .rejoin-container {
    background-color: #e8e8d0;
    border: 3px solid #000;
    border-radius: 15px;
    padding: 1.5rem;
    position: relative;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }

  .rejoin-container h3 {
    margin: 0 0 0.5rem 0;
    font-family: "Instrument Serif", serif;
    font-size: 18pt;
    color: #000;
    text-align: center;
  }

  .rejoin-container p {
    margin: 0 0 1rem 0;
    font-family: "Instrument Serif", serif;
    font-size: 16pt;
    color: #333;
    text-align: center;
  }

  .rejoin-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .rejoin-button {
    flex: 1;
    font-family: "Instrument Serif", serif;
    font-size: 16pt;
    padding: 0.8rem 1.2rem;
    background-color: #d0d0b8;
    color: #000;
    border: 2px solid #000;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .rejoin-button:hover {
    background-color: #b8b8a0;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .dismiss-button {
    width: 2.5rem;
    height: 2.5rem;
    font-family: "Instrument Serif", serif;
    font-size: 20pt;
    font-weight: bold;
    background-color: #ff6b6b;
    color: #fff;
    border: 2px solid #000;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  .dismiss-button:hover {
    background-color: #ff5252;
    transform: scale(1.05);
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .attribution {
      font-size: 16pt;
    }

    main {
      padding: 2rem;
    }

    .rejoin-container {
      padding: 1rem;
    }

    .rejoin-container h3 {
      font-size: 16pt;
    }

    .rejoin-container p {
      font-size: 14pt;
    }

    .rejoin-button {
      font-size: 14pt;
      padding: 0.6rem 1rem;
    }

    .dismiss-button {
      width: 2rem;
      height: 2rem;
      font-size: 16pt;
    }
  }

  @media (max-width: 480px) {
    .rejoin-container h3 {
      font-size: 14pt;
    }

    .rejoin-container p {
      font-size: 12pt;
    }

    .rejoin-button {
      font-size: 12pt;
      padding: 0.5rem 0.8rem;
    }

    .dismiss-button {
      width: 1.8rem;
      height: 1.8rem;
      font-size: 14pt;
    }
  }
</style>
