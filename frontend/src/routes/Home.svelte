<script>
  // Home page component
  import BrandContainer from "../lib/BrandContainer.svelte";
  import ActionsMenu from "../lib/ActionsMenu.svelte";

  let joinCode = "";

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
</script>

<main>
  <BrandContainer />
  <ActionsMenu bind:joinCode onJoin={handleJoin} onCreate={handleCreate} />
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
    padding: 3rem;
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

  /* Responsive design */
  @media (max-width: 768px) {
    .attribution {
      font-size: 16pt;
    }
  }
</style>
