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
          groupSize: groupSize,
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
</main>

<style>
  main {
    min-height: 100vh;
    background: linear-gradient(135deg, #ffff60 0%, #f0f048 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    position: relative;
    overflow-y: auto;
  }

  .create-menu {
    background-color: #e8e8d0;
    border: 3px solid #000;
    border-radius: 15px;
    padding: 2rem;
    width: 85%;
    max-width: 500px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    margin: 0 auto;
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .input-group,
  .slider-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    position: relative;
  }

  label {
    font-size: 20pt;
    font-weight: 400;
    color: #000;
    text-align: left;
  }

  .group-name-input {
    font-size: 18pt;
    font-family: "Instrument Serif", serif;
    padding: 0.8rem 1rem;
    border: 3px solid #000;
    border-radius: 10px;
    background-color: #f5f5f5;
    color: #000;
    outline: none;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .group-name-input:focus {
    background-color: #fff;
    border-color: #646cff;
    box-shadow: 0 0 0 3px rgba(100, 108, 255, 0.1);
  }

  .slider-group {
    position: relative;
  }

  .slider-group::after {
    content: "Adjust the number of participants";
    position: absolute;
    bottom: -25px;
    left: 0;
    font-size: 12pt;
    color: #666;
    font-style: italic;
  }

  .size-slider {
    width: 100%;
    height: 12px;
    background: linear-gradient(90deg, #ddd 0%, #a020f0 100%);
    border-radius: 6px;
    outline: none;
    appearance: none;
    cursor: pointer;
    transition: background 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .size-slider::-webkit-slider-thumb {
    appearance: none;
    width: 28px;
    height: 28px;
    background: #a020f0;
    border: 3px solid #fff;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 3px 6px rgba(160, 32, 240, 0.3);
  }

  .size-slider::-webkit-slider-thumb:hover {
    background: #8a1ad6;
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(160, 32, 240, 0.4);
  }

  .size-slider::-moz-range-thumb {
    width: 28px;
    height: 28px;
    background: #a020f0;
    border: 3px solid #fff;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 3px 6px rgba(160, 32, 240, 0.3);
  }

  .create-button {
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
    margin-top: 1rem;
    width: 100%;
    text-align: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .create-button:hover:not(:disabled) {
    background-color: #b8b8a0;
    transform: scale(1.05);
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
