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
    display: grid;
    grid-template-columns: 220px 100px 1fr;
    align-items: center;
    gap: 15px;
    width: 100%;
  }

  .action-label {
    font-size: 70pt;
    font-weight: 400;
    color: #000;
    text-align: left;
    justify-self: start;
  }

  .arrow {
    font-size: 70pt;
    color: #000;
    text-align: center;
    justify-self: center;
    width: 100%;
  }

  .create-button {
    font-size: 48pt;
    font-family: "Instrument Serif", serif;
    padding: 1rem 2rem;
    background-color: #e8e8d0;
    color: #000;
    border: 3px solid #000;
    border-radius: 15px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 300px;
    justify-self: start;
  }

  .create-button:hover {
    background-color: #d0d0b8;
    transform: translateY(-2px);
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .create-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: center;
      text-align: center;
    }

    .action-label {
      font-size: 40pt;
      text-align: center;
    }

    .arrow {
      font-size: 40pt;
      transform: rotate(90deg);
    }

    .create-button {
      font-size: 28pt;
      min-width: 200px;
    }
  }
</style>
