<script>
  export let joinCode = "";
  export let onJoin;
  export let errorMessage = "";
</script>

<div class="join-card">
  <div class="join-section">
    <label for="join-code">Enter Session Code</label>
    <input
      id="join-code"
      type="text"
      bind:value={joinCode}
      placeholder="Enter Code"
      class="code-input"
      on:keypress={(e) => e.key === "Enter" && onJoin()}
    />

    {#if errorMessage}
      <div class="error-message">
        {errorMessage}
      </div>
    {/if}

    <button class="join-button" on:click={onJoin} disabled={!joinCode.trim()}>
      Join Session
    </button>
  </div>
</div>

<style>
  .join-card {
    width: 100%;
    max-width: 500px;
    display: flex;
    justify-content: center;
  }

  .join-section {
    background-color: #e8e8d0;
    border: 3px solid #000;
    border-radius: 15px;
    padding: 2rem;
    width: 100%;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  label {
    font-size: 20pt;
    font-weight: 400;
    color: #000;
    text-align: left;
  }

  .code-input {
    font-size: 18pt;
    font-family: "Instrument Serif", serif;
    padding: 0.8rem 1rem;
    border: 3px solid #000;
    border-radius: 10px;
    background-color: #f5f5f5;
    color: #000;
    text-align: center;
    outline: none;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .code-input:focus {
    background-color: #fff;
    border-color: #646cff;
    box-shadow: 0 0 0 3px rgba(100, 108, 255, 0.1);
  }

  .code-input::placeholder {
    color: #888;
    font-style: italic;
  }

  .join-button {
    font-size: 18pt;
    font-family: "Instrument Serif", serif;
    font-weight: 400;
    padding: 1rem 1.5rem;
    background-color: #d0d0b8;
    color: #000;
    border: 3px solid #000;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .join-button:hover:not(:disabled) {
    background-color: #b8b8a0;
    transform: scale(1.05);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  .join-button:disabled {
    background-color: #e8e8e8;
    color: #999;
    border-color: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .error-message {
    background-color: #ffe6e6;
    border: 2px solid #ff4444;
    border-radius: 8px;
    color: #cc0000;
    padding: 0.8rem;
    font-size: 14pt;
    text-align: center;
  }

  /* Responsive design */
  @media (max-width: 480px) {
    .join-section {
      padding: 1.5rem;
    }

    label {
      font-size: 18pt;
    }

    .code-input,
    .join-button {
      font-size: 16pt;
    }
  }

  @media (min-width: 481px) and (max-width: 768px) {
    label {
      font-size: 19pt;
    }

    .code-input,
    .join-button {
      font-size: 17pt;
    }
  }
</style>
