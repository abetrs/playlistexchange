<script>
  import BrandContainer from "../lib/BrandContainer.svelte";
  import { onMount } from "svelte";
  import lastfmIcon from "../assets/brandico_lastfm.svg";
  import spotifyIcon from "../assets/streamline_spotify-remix.svg";

  export let joinCode = "";
  let userName = "";
  let selected = null;

  // This will be passed from the navigation
  export let params = {};

  onMount(() => {
    // If joinCode was passed via params, use it
    if (params && params.code) {
      joinCode = params.code;
    }
  });

  function connectLastfm() {
    console.log("Connecting to Last.fm with name:", userName);
    // Add Last.fm connection logic here
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
        <input
          type="text"
          bind:value={userName}
          placeholder="Enter Your Name"
          class="name-input"
        />
      </div>

      <div class="connection-section">
        <button class="connection-button lastfm" on:click={connectLastfm}>
          <img src={lastfmIcon} alt="Last.fm" class="icon" />
          <span>Connect to Last.fm</span>
        </button>
        <button class="connection-button spotify" on:click={connectSpotify}>
          <img src={spotifyIcon} alt="Spotify" class="icon" />
          <span>Connect to Spotify</span>
        </button>
      </div>
    </div>
  </div>

  <div class="attribution">By ReallyAbe</div>
</main>

<style>
  main {
    height: 100vh;
    max-height: 100vh;
    background-color: #ffff60;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    position: relative;
    overflow: hidden;
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

  .menu-title {
    font-size: 24pt;
    font-weight: 400;
    color: #000;
    margin: 0;
    text-align: left;
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
    .connection-button {
      font-size: 18pt;
      padding: 0.8rem 1.2rem;
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
    .connection-button {
      font-size: 16pt;
      padding: 0.6rem 1rem;
    }
  }
</style>
