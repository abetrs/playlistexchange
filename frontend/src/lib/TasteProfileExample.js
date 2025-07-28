/**
 * Example integration for taste profiles in the frontend
 * This shows how to use the taste profile API endpoints in a Svelte component
 */

// Example API service functions for frontend integration

/**
 * Build taste profile for a user
 * @param {string} userCode - User code
 * @param {boolean} forceRefresh - Force rebuild profile
 * @returns {Promise} API response
 */
export async function buildTasteProfile(userCode, forceRefresh = false) {
  const response = await fetch(
    `/api/user/${userCode}/taste-profile?forceRefresh=${forceRefresh}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to build taste profile: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get taste profile for a user
 * @param {string} userCode - User code
 * @returns {Promise} API response
 */
export async function getTasteProfile(userCode) {
  const response = await fetch(`/api/user/${userCode}/taste-profile`);

  if (!response.ok) {
    if (response.status === 404) {
      return null; // No profile exists
    }
    throw new Error(`Failed to get taste profile: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Calculate compatibility between two users
 * @param {string} userCodeA - First user code
 * @param {string} userCodeB - Second user code
 * @returns {Promise} API response
 */
export async function calculateCompatibility(userCodeA, userCodeB) {
  const response = await fetch(
    `/api/user/${userCodeA}/compatibility/${userCodeB}`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to calculate compatibility: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Build taste profiles for all users in a session
 * @param {string} sessionCode - Session code
 * @param {boolean} forceRefresh - Force rebuild profiles
 * @returns {Promise} API response
 */
export async function buildSessionProfiles(sessionCode, forceRefresh = false) {
  const response = await fetch(
    `/api/user/session/${sessionCode}/taste-profiles?forceRefresh=${forceRefresh}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to build session profiles: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Example Svelte component integration
 */
const ExampleSvelteComponent = `
<script>
  import { onMount } from 'svelte';
  import { buildTasteProfile, calculateCompatibility } from './tasteProfileApi.js';
  
  export let sessionCode;
  export let currentUserCode;
  
  let participants = [];
  let compatibilityScores = new Map();
  let isBuilding = false;
  let error = null;

  onMount(async () => {
    await loadSessionData();
  });

  async function loadSessionData() {
    try {
      // Fetch session participants (existing API)
      const response = await fetch(\`/api/session/\${sessionCode}/participants\`);
      const data = await response.json();
      participants = data.participants;
    } catch (err) {
      error = 'Failed to load session data';
    }
  }

  async function buildAllProfiles() {
    isBuilding = true;
    error = null;
    
    try {
      // Build profiles for all participants
      for (const participant of participants) {
        try {
          await buildTasteProfile(participant.code);
          console.log(\`Profile built for \${participant.name}\`);
        } catch (err) {
          console.error(\`Failed to build profile for \${participant.name}\`, err);
        }
      }
      
      // Calculate compatibility scores
      await calculateAllCompatibilities();
      
    } catch (err) {
      error = 'Failed to build profiles';
    } finally {
      isBuilding = false;
    }
  }

  async function calculateAllCompatibilities() {
    compatibilityScores.clear();
    
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        const userA = participants[i];
        const userB = participants[j];
        
        try {
          const result = await calculateCompatibility(userA.code, userB.code);
          const key = \`\${userA.code}-\${userB.code}\`;
          compatibilityScores.set(key, result.compatibility);
        } catch (err) {
          console.error(\`Failed to calculate compatibility between \${userA.name} and \${userB.name}\`, err);
        }
      }
    }
    
    // Trigger reactivity
    compatibilityScores = compatibilityScores;
  }

  function getCompatibilityScore(userCodeA, userCodeB) {
    const key1 = \`\${userCodeA}-\${userCodeB}\`;
    const key2 = \`\${userCodeB}-\${userCodeA}\`;
    return compatibilityScores.get(key1) || compatibilityScores.get(key2);
  }

  function formatScore(score) {
    return Math.round(score * 100);
  }
</script>

<div class="taste-profile-section">
  <h2>Music Compatibility Analysis</h2>
  
  {#if error}
    <div class="error">{error}</div>
  {/if}
  
  <div class="actions">
    <button 
      on:click={buildAllProfiles} 
      disabled={isBuilding}
      class="build-profiles-btn"
    >
      {isBuilding ? 'Building Profiles...' : 'Analyze Music Tastes'}
    </button>
  </div>

  {#if compatibilityScores.size > 0}
    <div class="compatibility-matrix">
      <h3>Compatibility Scores</h3>
      
      <div class="matrix-grid">
        {#each participants as userA}
          {#each participants as userB}
            {#if userA.code !== userB.code}
              {@const compatibility = getCompatibilityScore(userA.code, userB.code)}
              {#if compatibility}
                <div class="compatibility-card">
                  <div class="user-pair">
                    <span class="user-name">{userA.name}</span>
                    <span class="connector">↔</span>
                    <span class="user-name">{userB.name}</span>
                  </div>
                  <div class="score-display">
                    <div class="overall-score">{formatScore(compatibility.scores.overall)}%</div>
                    <div class="score-breakdown">
                      <span>Artists: {formatScore(compatibility.scores.artists)}%</span>
                      <span>Tracks: {formatScore(compatibility.scores.tracks)}%</span>
                    </div>
                  </div>
                  {#if compatibility.commonElements.artists.length > 0}
                    <div class="common-artists">
                      <strong>Common artists:</strong>
                      {compatibility.commonElements.artists.slice(0, 3).join(', ')}
                      {#if compatibility.commonElements.artists.length > 3}
                        <span class="more-count">
                          +{compatibility.commonElements.artists.length - 3} more
                        </span>
                      {/if}
                    </div>
                  {/if}
                </div>
              {/if}
            {/if}
          {/each}
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .taste-profile-section {
    background: #e8e8d0;
    border: 2px solid #000;
    border-radius: 15px;
    padding: 2rem;
    margin: 1rem 0;
  }

  .build-profiles-btn {
    background: #ffff60;
    border: 2px solid #000;
    border-radius: 8px;
    padding: 0.75rem 1.5rem;
    font-size: 16pt;
    font-family: 'Instrument Serif', serif;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .build-profiles-btn:hover:not(:disabled) {
    background: #f5f5f5;
    transform: translateY(-2px);
  }

  .build-profiles-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .compatibility-matrix {
    margin-top: 2rem;
  }

  .matrix-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .compatibility-card {
    background: white;
    border: 2px solid #000;
    border-radius: 8px;
    padding: 1rem;
  }

  .user-pair {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .user-name {
    font-weight: bold;
    font-size: 14pt;
  }

  .connector {
    font-size: 18pt;
    color: #666;
  }

  .score-display {
    text-align: center;
    margin-bottom: 0.75rem;
  }

  .overall-score {
    font-size: 24pt;
    font-weight: bold;
    color: #333;
  }

  .score-breakdown {
    display: flex;
    justify-content: space-around;
    font-size: 12pt;
    color: #666;
    margin-top: 0.25rem;
  }

  .common-artists {
    font-size: 12pt;
    line-height: 1.4;
    border-top: 1px solid #eee;
    padding-top: 0.5rem;
  }

  .more-count {
    color: #666;
    font-style: italic;
  }

  .error {
    background: #ffebee;
    color: #c62828;
    padding: 1rem;
    border-radius: 8px;
    border: 2px solid #ef5350;
    margin-bottom: 1rem;
  }

  @media (max-width: 768px) {
    .matrix-grid {
      grid-template-columns: 1fr;
    }
    
    .user-pair {
      flex-direction: column;
      text-align: center;
    }
    
    .connector {
      transform: rotate(90deg);
    }
  }
</style>
`;

export { ExampleSvelteComponent };
