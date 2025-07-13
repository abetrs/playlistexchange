<script>
  export let onCreate;
</script>

<div class="create-section">
  <span class="action-label">Create</span>
  <span class="arrow">→</span>
  <button class="create-button" on:click={onCreate}> Press Here! </button>
</div>

<style>
  .create-section {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
    width: 100%;
    max-width: 500px;
    justify-content: center;
  }

  .action-label {
    font-size: 24pt;
    font-weight: 400;
    color: #000;
    text-align: center;
    white-space: nowrap;
    flex-shrink: 0;
    width: 120px;
    min-width: 120px;
  }

  .arrow {
    font-size: 24pt;
    color: #000;
    text-align: center;
    margin: 0 0.5rem;
    transition:
      font-size 0.2s,
      opacity 0.2s;
    flex-shrink: 0;
    max-width: 2em;
    overflow: hidden;
    white-space: nowrap;
  }

  .create-button {
    font-size: 24pt;
    font-family: "Instrument Serif", serif;
    padding: 1rem 1.5rem;
    background-color: #e8e8d0;
    color: #000;
    border: 3px solid #000;
    border-radius: 15px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 120px;
    width: 100%;
  }

  .create-button:hover {
    background-color: #d0d0b8;
    transform: translateY(-2px);
  }

  /* Responsive design */
  @media (max-width: 900px) {
    .create-section {
      max-width: 95vw;
      gap: 0.5rem;
    }
    .action-label {
      font-size: 18pt;
    }
    .arrow {
      font-size: 16pt;
    }
    .create-button {
      font-size: 16pt;
      min-width: 80px;
    }
  }

  @media (max-width: 600px) {
    .create-section {
      flex-direction: column;
      align-items: stretch;
      gap: 0.5rem;
    }
    .arrow {
      display: none;
    }
  }
</style>
