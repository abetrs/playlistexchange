<script>
  import BrandContainer from "./lib/BrandContainer.svelte";
  import ActionsMenu from "./lib/ActionsMenu.svelte";

  let joinCode = "";

  function handleJoin() {
    if (joinCode.trim()) {
      console.log("Joining with code:", joinCode);
      // Handle join logic here
    }
  }

  function handleCreate() {
    console.log("Creating new session");
    // Handle create logic here
  }
</script>

<main>
  <BrandContainer />
  <ActionsMenu bind:joinCode onJoin={handleJoin} onCreate={handleCreate} />
  <div class="attribution">By ReallyAbe</div>
</main>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;0,600;1,400&display=swap");

  main {
    height: 100vh;
    max-height: 100vh;
    background-color: #ffff00;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    font-family: "Instrument Serif", serif;
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
