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

  .code-input {
    font-size: 48pt;
    font-family: "Instrument Serif", serif;
    padding: 1rem 2rem;
    border: none;
    border-radius: 15px;
    background-color: #e8e8d0;
    color: #000;
    text-align: center;
    min-width: 300px;
    outline: none;
    justify-self: start;
  }

  .code-input::placeholder {
    color: #999;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .join-section {
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

    .code-input {
      font-size: 28pt;
      min-width: 200px;
    }
  }
</style>
