<script>
  export let joinCode = "";
  export let onJoin;
</script>

<div class="join-section">
  <span class="action-label">Join</span>
  <span class="arrow">→</span>
  <input
    type="text"
    bind:value={joinCode}
    placeholder="Enter Code"
    class="code-input"
    on:keypress={(e) => e.key === "Enter" && onJoin()}
  />
</div>

<style>
  .join-section {
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

  .code-input {
    font-size: 24pt;
    font-family: "Instrument Serif", serif;
    padding: 1rem 1.5rem;
    border: 3px solid #000;
    border-radius: 15px;
    background-color: #e8e8d0;
    color: #000;
    text-align: center;
    min-width: 120px;
    width: 100%;
    box-sizing: border-box;
    outline: none;
  }

  .code-input::placeholder {
    color: #999;
  }

  /* Responsive design */
  @media (max-width: 900px) {
    .join-section {
      max-width: 95vw;
      gap: 0.5rem;
    }
    .action-label {
      font-size: 18pt;
    }
    .arrow {
      font-size: 16pt;
    }
    .code-input {
      font-size: 16pt;
      min-width: 80px;
    }
  }

  @media (max-width: 600px) {
    .join-section {
      flex-direction: column;
      align-items: stretch;
      gap: 0.5rem;
    }
    .arrow {
      display: none;
    }
  }
</style>
