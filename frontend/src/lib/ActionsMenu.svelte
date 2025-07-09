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
    gap: 3rem;
    align-items: flex-start;
    width: 100%;
    max-width: 1000px;
    /* Remove transform, let's use a different approach */
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .actions-container {
      align-items: center;
    }
  }
</style>
