<script>
  import BrandContainer from "../lib/BrandContainer.svelte";

  let groupName = "";
  let groupSize = 1;

  function handleCreate() {
    console.log("Creating group:", { groupName, groupSize });
    // Handle create logic here
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
        />
      </div>

      <div class="user-count">{groupSize} users</div>
    </div>
  </div>

  <div class="attribution">By ReallyAbe</div>
</main>

<style>
  main {
    height: 100vh;
    max-height: 100vh;
    background-color: #ffff60;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
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

  .create-menu {
    background-color: #e8e8d0;
    border: 3px solid #000;
    border-radius: 15px;
    padding: 3rem;
    width: 90%;
    max-width: 600px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }

  .menu-title {
    font-size: 24pt;
    font-weight: 400;
    color: #000;
    margin: 0;
    text-align: left;
  }

  .menu-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
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
    gap: 2rem;
  }

  .input-group,
  .slider-group {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  label {
    font-size: 24pt;
    font-weight: 400;
    color: #000;
    min-width: 150px;
    text-align: left;
  }

  .arrow {
    font-size: 24pt;
    color: #000;
    margin: 0 0.5rem;
  }

  .group-name-input {
    flex: 1;
    font-size: 20pt;
    font-family: "Instrument Serif", serif;
    padding: 0.8rem 1rem;
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
    font-size: 3.2em;
    font-weight: 400;
    color: #000;
    text-align: center;
    margin-top: 1rem;
    line-height: 1.1;
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
