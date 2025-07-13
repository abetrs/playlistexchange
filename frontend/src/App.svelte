<script>
  import Home from "./routes/Home.svelte";
  import Create from "./routes/Create.svelte";
  import Join from "./routes/Join.svelte";

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

{#if currentPath === "/"}
  <Home />
{:else if currentPath === "/create"}
  <Create />
{:else if currentPath.startsWith("/join/")}
  <Join params={{ code: currentPath.split("/")[2] }} />
{:else}
  <Home />
{/if}

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
  }
</style>
