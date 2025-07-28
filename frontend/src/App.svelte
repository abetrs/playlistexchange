<script>
  import Home from "./routes/Home.svelte";
  import Create from "./routes/Create.svelte";
  import Join from "./routes/Join.svelte";
  import Participants from "./routes/Participants.svelte";
  import Results from "./routes/Results.svelte";
  import BrandContainer from "./lib/BrandContainer.svelte";
  import { fade } from "svelte/transition";

  let currentPath = $state(window.location.pathname);

  // Simple routing logic
  function updatePath() {
    currentPath = window.location.pathname;
  }

  // Listen for navigation events
  window.addEventListener("popstate", updatePath);

  // Custom navigation function
  function navigate(path) {
    window.history.pushState({}, "", path);
    updatePath();
  }

  // Make navigate available globally for other components
  window.navigate = navigate;
</script>

<header class="app-header">
  <div class="header-left">
    <div class="logo">Itch</div>
  </div>
  <div class="header-right">
    <div class="attribution">By ReallyAbe</div>
  </div>
</header>

<main class="app-main">
  {#key currentPath}
    <div in:fade={{ duration: 300 }} out:fade={{ duration: 300 }}>
      {#if currentPath === "/"}
        <Home />
      {:else if currentPath === "/create"}
        <Create />
      {:else if currentPath === "/join"}
        <Join />
      {:else if currentPath.startsWith("/join/")}
        <Join params={{ code: currentPath.split("/")[2] }} />
      {:else if currentPath.startsWith("/participants/")}
        <Participants params={{ code: currentPath.split("/")[2] }} />
      {:else if currentPath.startsWith("/results/")}
        <Results params={{ code: currentPath.split("/")[2] }} />
      {:else}
        <Home />
      {/if}
    </div>
  {/key}
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: "Instrument Serif", serif;
  }

  :global(#app) {
    width: 100%;
    height: 100vh;
    margin: 0;
    padding: 0;
    overflow: hidden;
    background: linear-gradient(135deg, #ffff60 0%, #f0f048 100%);
    background-attachment: fixed;
  }

  .app-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: rgba(255, 255, 96, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 2px solid #000;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    z-index: 1000;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .logo {
    font-family: "Instrument Serif", serif;
    font-size: 24pt;
    font-weight: 400;
    color: #000;
  }

  .attribution {
    font-family: Helvetica, Arial, sans-serif;
    font-size: 14pt;
    color: #000;
    font-weight: 400;
  }

  .app-main {
    margin-top: 60px;
    height: calc(100vh - 60px);
    overflow-y: auto;
  }

  /* Responsive design */
  @media (max-width: 480px) {
    .app-header {
      padding: 0 1rem;
    }

    .logo {
      font-size: 18pt;
    }

    .attribution {
      font-size: 12pt;
    }
  }

  @media (min-width: 481px) and (max-width: 768px) {
    .logo {
      font-size: 20pt;
    }

    .attribution {
      font-size: 13pt;
    }
  }
</style>
