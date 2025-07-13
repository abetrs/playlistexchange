<script>
  import JoinSection from "./JoinSection.svelte";
  import CreateSection from "./CreateSection.svelte";

  export let joinCode = "";
  export let onJoin;
  export let onCreate;
</script>

<div class="actions-container">
  <JoinSection bind:joinCode {onJoin} />
  <CreateSection {onCreate} />
</div>

<style>
  .actions-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    width: 100%;
    max-width: 500px;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .actions-container {
      max-width: 95vw;
      gap: 1rem;
    }
  }
</style>
