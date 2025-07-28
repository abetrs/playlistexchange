<div class="brand-container">
  <div class="brand-box">
    <h1 class="brand-title">Itch</h1>
  </div>
</div>

<style>
  .brand-container {
    margin-bottom: 2rem;
    width: 100%;
    max-width: 400px;
    display: flex;
    justify-content: center;
  }

  .brand-box {
    background-color: #e8e8d0;
    padding: 1.5rem 2.5rem;
    border-radius: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
    width: 100%;
    box-sizing: border-box;
  }

  .brand-box:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }

  .brand-title {
    font-family: "Instrument Serif", serif;
    font-size: 60pt;
    font-weight: 400;
    margin: 0;
    color: #000;
    text-align: center;
  }

  /* Responsive design */
  @media (max-width: 480px) {
    .brand-title {
      font-size: 36pt;
    }

    .brand-box {
      padding: 1rem 2rem;
    }
  }

  @media (min-width: 481px) and (max-width: 768px) {
    .brand-title {
      font-size: 48pt;
    }
  }
</style>
