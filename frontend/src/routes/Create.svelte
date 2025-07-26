<script>
  import BrandContainer from "../lib/BrandContainer.svelte";
  import { API_ENDPOINTS } from "../config.js";

  let groupName = "";
  let groupSize = 1;
  let isLoading = false;
  let errorMessage = "";
  let successMessage = "";

  async function handleCreate() {
    // Reset messages
    errorMessage = "";
    successMessage = "";

    // Validate inputs
    if (!groupName.trim()) {
      errorMessage = "Please enter a group name";
      return;
    }

    if (groupSize < 1 || groupSize > 20) {
      errorMessage = "Group size must be between 1 and 20";
      return;
    }

    isLoading = true;

    try {
      const response = await fetch(API_ENDPOINTS.SESSIONS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupName: groupName.trim(),
          groupSize: parseInt(groupSize),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        successMessage = `Session created successfully! Code: ${data.sessionCode}`;

        // Store session code for future use
        sessionStorage.setItem("sessionCode", data.sessionCode);
        sessionStorage.setItem("isCreator", "true");

        // Redirect to join page so creator can add themselves to the session
        setTimeout(() => {
          window.navigate(`/join/${data.sessionCode}`);
        }, 1500);
      } else {
        errorMessage = data.message || "Failed to create session";
      }
    } catch (error) {
      console.error("Error creating session:", error);
      errorMessage = "Network error. Please check if the server is running.";
    } finally {
      isLoading = false;
    }
  }

  function goBack() {
    window.navigate("/");
  }
</script>

<main>
  <BrandContainer />

  <div class="create-menu">
    <div class="menu-header">
      <button class="back-button" on:click={goBack}>← Back</button>
      <h2 class="menu-title">Create Menu</h2>
    </div>

    <div class="form-section">
      <div class="input-group">
        <label for="group-name">Group Name</label>
        <span class="arrow">→</span>
        <input
          id="group-name"
          type="text"
          bind:value={groupName}
          placeholder="What?"
          class="group-name-input"
          disabled={isLoading}
        />
      </div>

      <div class="slider-group">
        <label for="group-size">Size</label>
        <span class="arrow">→</span>
        <input
          id="group-size"
          type="range"
          min="1"
          max="20"
          bind:value={groupSize}
          class="size-slider"
          disabled={isLoading}
        />
      </div>

      <div class="user-count">{groupSize} users</div>

      <!-- Error Message -->
      {#if errorMessage}
        <div class="message error-message">
          {errorMessage}
        </div>
      {/if}

      <!-- Success Message -->
      {#if successMessage}
        <div class="message success-message">
          {successMessage}
        </div>
      {/if}

      <!-- Create Button -->
      <button
        class="create-button"
        on:click={handleCreate}
        disabled={isLoading || !groupName.trim()}
      >
        {#if isLoading}
          Creating...
        {:else}
          Create Session
        {/if}
      </button>
    </div>
  </div>

  <div class="attribution">By ReallyAbe</div>
</main>

<style>
  main {
    min-height: 100vh;
    background-color: #ffff60;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    position: relative;
    overflow-y: auto;
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

  .create-menu {
    background-color: #e8e8d0;
    border: 3px solid #000;
    border-radius: 15px;
    padding: 2rem;
    width: 85%;
    max-width: 500px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }

  .menu-title {
    font-size: 22pt;
    font-weight: 400;
    color: #000;
    margin: 0;
    text-align: left;
  }

  .menu-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .back-button {
    font-size: 18pt;
    font-family: "Instrument Serif", serif;
    padding: 0.5rem 1rem;
    background-color: #d0d0b8;
    color: #000;
    border: 2px solid #000;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .back-button:hover {
    background-color: #b8b8a0;
    transform: translateY(-1px);
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .input-group,
  .slider-group {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  label {
    font-size: 20pt;
    font-weight: 400;
    color: #000;
    min-width: 120px;
    text-align: left;
  }

  .arrow {
    font-size: 20pt;
    color: #000;
    margin: 0 0.5rem;
  }

  .group-name-input {
    flex: 1;
    font-size: 18pt;
    font-family: "Instrument Serif", serif;
    padding: 0.6rem 0.8rem;
    border: 2px solid #000;
    border-radius: 8px;
    background-color: #f5f5f5;
    color: #000;
    outline: none;
    transition: all 0.2s ease;
  }

  .group-name-input:focus {
    background-color: #fff;
    border-color: #646cff;
    box-shadow: 0 0 0 3px rgba(100, 108, 255, 0.1);
  }

  .group-name-input::placeholder {
    color: #888;
    font-style: italic;
  }

  .size-slider {
    flex: 1;
    height: 8px;
    background: #ddd;
    border-radius: 5px;
    outline: none;
    appearance: none;
    cursor: pointer;
    transition: background 0.2s;
  }

  .size-slider::-webkit-slider-thumb {
    appearance: none;
    width: 24px;
    height: 24px;
    background: #fff;
    border: 2px solid #000;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .size-slider::-webkit-slider-thumb:hover {
    background: #f0f0f0;
    transform: scale(1.1);
  }

  .size-slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    background: #fff;
    border: 2px solid #000;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .size-slider::-moz-range-thumb:hover {
    background: #f0f0f0;
    transform: scale(1.1);
  }

  .user-count {
    font-size: 2.5em;
    font-weight: 400;
    color: #000;
    text-align: center;
    margin-top: 0.5rem;
    line-height: 1.1;
  }

  .message {
    padding: 0.8rem;
    border-radius: 8px;
    font-size: 14pt;
    text-align: center;
    margin: 0.8rem 0;
    border: 2px solid;
  }

  .error-message {
    background-color: #ffe6e6;
    border-color: #ff4444;
    color: #cc0000;
  }

  .success-message {
    background-color: #e6ffe6;
    border-color: #44ff44;
    color: #006600;
  }

  .create-button {
    font-size: 18pt;
    font-family: "Instrument Serif", serif;
    font-weight: 400;
    padding: 0.8rem 1.5rem;
    background-color: #d0d0b8;
    color: #000;
    border: 3px solid #000;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 0.8rem;
    width: 100%;
    text-align: center;
  }

  .create-button:hover:not(:disabled) {
    background-color: #b8b8a0;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  .create-button:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .create-button:disabled {
    background-color: #e8e8e8;
    color: #999;
    border-color: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .group-name-input:disabled,
  .size-slider:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .attribution {
      font-size: 16pt;
    }

    .create-menu {
      padding: 2rem;
      width: 95%;
    }

    .menu-title {
      font-size: 20pt;
    }

    .input-group,
    .slider-group {
      flex-direction: column;
      align-items: stretch;
      gap: 0.5rem;
    }

    label {
      font-size: 20pt;
      min-width: auto;
      text-align: center;
    }

    .arrow {
      display: none;
    }

    .group-name-input {
      font-size: 18pt;
    }

    .user-count {
      font-size: 2.5em;
    }
  }

  @media (max-width: 480px) {
    .create-menu {
      padding: 1.5rem;
    }

    .menu-title {
      font-size: 18pt;
    }

    label {
      font-size: 18pt;
    }

    .group-name-input {
      font-size: 16pt;
      padding: 0.6rem 0.8rem;
    }

    .user-count {
      font-size: 2em;
    }
  }
</style>
