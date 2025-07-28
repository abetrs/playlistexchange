const lastfmService = require("./lastfm.service");
const { db } = require("../firebase");
const axios = require("axios"); // For Spotify API calls once integrated

/**
 * Helper function to get user document by code from Firestore
 * @param {string} userCode - User code from session.
 * @returns {Promise<Object>} User document data.
 */
async function getUserByCode(userCode) {
  try {
    const userRef = db.collection("users").doc(userCode);
    const doc = await userRef.get();

    if (!doc.exists) {
      throw new Error(`User not found: ${userCode}`);
    }

    return doc.data();
  } catch (error) {
    console.error(`Error fetching user ${userCode}:`, error);
    throw error;
  }
}

/**
 * Builds a taste profile for a user.
 * @param {string} userCode - User code from session.
 * @returns {Promise<Object>} Profile with vectorized data.
 */
async function buildTasteProfile(userCode) {
  try {
    // Fetch from Firestore (user doc has lastfmUsername)
    const user = await getUserByCode(userCode);

    if (!user.lastfmUsername) {
      throw new Error("No Last.fm data available for user");
    }

    console.log(
      `Building taste profile for user ${userCode} (${user.name}) with Last.fm: ${user.lastfmUsername}`
    );

    // Use existing Last.fm service to fetch top artists and tracks
    const topArtistsResponse = await lastfmService.getTopArtists(
      user.lastfmUsername,
      "overall",
      50
    );
    const topTracksResponse = await lastfmService.getTopTracks(
      user.lastfmUsername,
      "overall",
      100
    );

    // Extract artist data from the API response
    const topArtists = topArtistsResponse.topartists?.artist || [];
    const topTracks = topTracksResponse.toptracks?.track || [];

    // Vectorize artists: { artistName: playcount } for cosine similarity
    const artistVector = topArtists.reduce((vec, artist) => {
      const artistName = artist.name.toLowerCase().trim();
      const playcount = parseInt(artist.playcount, 10) || 1;

      // Apply log-scale normalization to handle sparse data
      vec[artistName] = Math.log(playcount + 1);
      return vec;
    }, {});

    // Vectorize tracks: { "artist - track": playcount }
    const trackVector = topTracks.reduce((vec, track) => {
      const trackKey = `${track.artist.name.toLowerCase().trim()} - ${track.name
        .toLowerCase()
        .trim()}`;
      const playcount = parseInt(track.playcount, 10) || 1;

      // Apply log-scale normalization
      vec[trackKey] = Math.log(playcount + 1);
      return vec;
    }, {});

    // TODO: Add genre vector extraction using Last.fm tags
    // const genreVector = await extractGenreVector(topArtists, topTracks);

    // TODO: Add Spotify top artists once integrated
    // const spotifyVector = {};
    // if (user.spotifyId && user.spotifyToken) {
    //   const spotifyTop = await axios.get('https://api.spotify.com/v1/me/top/artists', {
    //     headers: { Authorization: `Bearer ${user.spotifyToken}` }
    //   });
    //   // Process Spotify data...
    // }

    const profile = {
      userCode,
      userName: user.name,
      lastfmUsername: user.lastfmUsername,
      artistVector,
      trackVector,
      // genreVector: {}, // Placeholder for future implementation
      // spotifyVector: {}, // Placeholder for future implementation
      metadata: {
        totalArtists: topArtists.length,
        totalTracks: topTracks.length,
        createdAt: new Date(),
        dataSource: "lastfm",
      },
    };

    console.log(
      `Profile built successfully for ${userCode}: ${profile.metadata.totalArtists} artists, ${profile.metadata.totalTracks} tracks`
    );

    return profile;
  } catch (error) {
    console.error(`Profile build failed for ${userCode}:`, error.message);
    throw error; // Handle in controller
  }
}

/**
 * Computes Jaccard similarity between two sets (e.g., top artists).
 * @param {Set} setA
 * @param {Set} setB
 * @returns {number} Similarity score (0-1).
 */
function jaccardSimilarity(setA, setB) {
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * Computes cosine similarity between two vectors.
 * @param {Object} vecA - {item: weight}
 * @param {Object} vecB
 * @returns {number} Score (0-1).
 */
function cosineSimilarity(vecA, vecB) {
  const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  keys.forEach((key) => {
    const a = vecA[key] || 0;
    const b = vecB[key] || 0;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  });

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Calculate cosine similarity between two vectors (legacy function for backward compatibility)
 * @param {Object} vectorA - First vector (object with key-value pairs)
 * @param {Object} vectorB - Second vector (object with key-value pairs)
 * @returns {number} Cosine similarity score (0-1)
 */
function calculateCosineSimilarity(vectorA, vectorB) {
  return cosineSimilarity(vectorA, vectorB);
}

/**
 * Calculate compatibility score between two user profiles
 * @param {Object} profileA - First user's taste profile
 * @param {Object} profileB - Second user's taste profile
 * @returns {Object} Compatibility analysis with scores and details
 */
function calculateCompatibility(profileA, profileB) {
  try {
    // Calculate similarity scores for different vectors using improved cosine similarity
    const artistSimilarity = cosineSimilarity(
      profileA.artistVector,
      profileB.artistVector
    );
    const trackSimilarity = cosineSimilarity(
      profileA.trackVector,
      profileB.trackVector
    );

    // Also calculate Jaccard similarity for comparison
    const artistSetA = new Set(Object.keys(profileA.artistVector));
    const artistSetB = new Set(Object.keys(profileB.artistVector));
    const trackSetA = new Set(Object.keys(profileA.trackVector));
    const trackSetB = new Set(Object.keys(profileB.trackVector));

    const artistJaccard = jaccardSimilarity(artistSetA, artistSetB);
    const trackJaccard = jaccardSimilarity(trackSetA, trackSetB);

    // Weighted overall score (artists have more weight than individual tracks)
    // Using cosine similarity for the main score as it handles weighted preferences better
    const overallScore = artistSimilarity * 0.7 + trackSimilarity * 0.3;

    // Find common artists and tracks
    const commonArtists = Object.keys(profileA.artistVector).filter(
      (artist) => profileB.artistVector[artist]
    );

    const commonTracks = Object.keys(profileA.trackVector).filter(
      (track) => profileB.trackVector[track]
    );

    return {
      userA: {
        code: profileA.userCode,
        name: profileA.userName,
      },
      userB: {
        code: profileB.userCode,
        name: profileB.userName,
      },
      scores: {
        artists: Math.round(artistSimilarity * 100) / 100,
        tracks: Math.round(trackSimilarity * 100) / 100,
        overall: Math.round(overallScore * 100) / 100,
        // Additional metrics for analysis
        artistJaccard: Math.round(artistJaccard * 100) / 100,
        trackJaccard: Math.round(trackJaccard * 100) / 100,
      },
      commonElements: {
        artists: commonArtists.slice(0, 10), // Top 10 common artists
        tracks: commonTracks.slice(0, 10), // Top 10 common tracks
        artistCount: commonArtists.length,
        trackCount: commonTracks.length,
      },
      metadata: {
        calculatedAt: new Date(),
        profileADataSource: profileA.metadata.dataSource,
        profileBDataSource: profileB.metadata.dataSource,
      },
    };
  } catch (error) {
    console.error("Error calculating compatibility:", error);
    throw error;
  }
}

/**
 * Store or update taste profile in Firestore
 * @param {string} userCode - User code
 * @param {Object} profile - Taste profile data
 * @returns {Promise<void>}
 */
async function storeTasteProfile(userCode, profile) {
  try {
    const userRef = db.collection("users").doc(userCode);

    await userRef.update({
      "profileData.lastfm": {
        artistVector: profile.artistVector,
        trackVector: profile.trackVector,
        metadata: profile.metadata,
        updatedAt: new Date(),
      },
      updatedAt: new Date(),
    });

    console.log(`Taste profile stored for user ${userCode}`);
  } catch (error) {
    console.error(`Error storing taste profile for ${userCode}:`, error);
    throw error;
  }
}

/**
 * Retrieve cached taste profile from Firestore
 * @param {string} userCode - User code
 * @returns {Promise<Object|null>} Cached profile or null if not found/expired
 */
async function getCachedTasteProfile(userCode) {
  try {
    const user = await getUserByCode(userCode);

    if (!user.profileData?.lastfm?.metadata) {
      return null; // No cached profile
    }

    const profile = user.profileData.lastfm;
    const cacheAge = new Date() - new Date(profile.metadata.createdAt);
    const maxCacheAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (cacheAge > maxCacheAge) {
      console.log(
        `Cached profile for ${userCode} is expired (${Math.round(
          cacheAge / (60 * 60 * 1000)
        )} hours old)`
      );
      return null; // Cache expired
    }

    console.log(`Using cached profile for ${userCode}`);
    return {
      userCode,
      userName: user.name,
      lastfmUsername: user.lastfmUsername,
      artistVector: profile.artistVector,
      trackVector: profile.trackVector,
      metadata: profile.metadata,
    };
  } catch (error) {
    console.error(`Error retrieving cached profile for ${userCode}:`, error);
    return null;
  }
}

/**
 * Get session by code from Firestore
 * @param {string} sessionCode - Session code
 * @returns {Promise<Object>} Session document data
 */
async function getSessionByCode(sessionCode) {
  try {
    const sessionRef = db.collection("sessions").doc(sessionCode);
    const doc = await sessionRef.get();

    if (!doc.exists) {
      throw new Error(`Session not found: ${sessionCode}`);
    }

    return doc.data();
  } catch (error) {
    console.error(`Error fetching session ${sessionCode}:`, error);
    throw error;
  }
}

/**
 * Update session data in Firestore
 * @param {string} sessionCode - Session code
 * @param {Object} updateData - Data to update
 * @returns {Promise<void>}
 */
async function updateSession(sessionCode, updateData) {
  try {
    const sessionRef = db.collection("sessions").doc(sessionCode);
    await sessionRef.update({
      ...updateData,
      updatedAt: new Date(),
    });

    console.log(`Session ${sessionCode} updated successfully`);
  } catch (error) {
    console.error(`Error updating session ${sessionCode}:`, error);
    throw error;
  }
}

/**
 * Matches users in a session by calculating pairwise compatibility scores.
 * @param {string} sessionCode - Session code
 * @returns {Promise<Array>} Sorted matches [{pair: [code1, code2], score, userA: {}, userB: {}, details: {}}].
 */
async function computeMatches(sessionCode) {
  try {
    console.log(`Computing matches for session ${sessionCode}`);

    // Get session data
    const session = await getSessionByCode(sessionCode);

    if (!session.participants || session.participants.length < 2) {
      throw new Error("Need at least 2 users to compute matches");
    }

    const participantCodes = session.participants.map((p) => p.userCode || p);

    console.log(
      `Found ${participantCodes.length} participants: ${participantCodes.join(
        ", "
      )}`
    );

    // Get taste profiles for all participants
    const profiles = [];
    const profileErrors = [];

    for (const userCode of participantCodes) {
      try {
        let profile = await getCachedTasteProfile(userCode);

        if (!profile) {
          // Try to build profile if not cached
          console.log(`Building profile for user ${userCode}`);
          profile = await buildTasteProfile(userCode);
          await storeTasteProfile(userCode, profile);
        }

        profiles.push(profile);
      } catch (error) {
        console.error(
          `Failed to get profile for user ${userCode}:`,
          error.message
        );
        profileErrors.push({
          userCode,
          error: error.message,
        });
      }
    }

    if (profiles.length < 2) {
      throw new Error(
        `Not enough profiles available. Got ${profiles.length}, need at least 2.`
      );
    }

    console.log(`Successfully loaded ${profiles.length} profiles`);

    // Calculate pairwise matches
    const matches = [];
    for (let i = 0; i < profiles.length; i++) {
      for (let j = i + 1; j < profiles.length; j++) {
        try {
          const compatibility = calculateCompatibility(
            profiles[i],
            profiles[j]
          );

          matches.push({
            pair: [profiles[i].userCode, profiles[j].userCode],
            score: compatibility.scores.overall,
            userA: compatibility.userA,
            userB: compatibility.userB,
            details: {
              artistScore: compatibility.scores.artists,
              trackScore: compatibility.scores.tracks,
              artistJaccard: compatibility.scores.artistJaccard,
              trackJaccard: compatibility.scores.trackJaccard,
              commonArtists: compatibility.commonElements.artistCount,
              commonTracks: compatibility.commonElements.trackCount,
              topCommonArtists: compatibility.commonElements.artists.slice(
                0,
                5
              ),
              topCommonTracks: compatibility.commonElements.tracks.slice(0, 5),
            },
          });
        } catch (error) {
          console.error(
            `Failed to calculate compatibility between ${profiles[i].userCode} and ${profiles[j].userCode}:`,
            error.message
          );
        }
      }
    }

    // Sort matches by score (descending - best matches first)
    matches.sort((a, b) => b.score - a.score);

    console.log(
      `Calculated ${matches.length} matches, best score: ${
        matches[0]?.score || "N/A"
      }`
    );

    // Prepare update data, filtering out undefined values for Firestore
    const updateData = {
      matches,
      matchingCompletedAt: new Date(),
      status: "matched",
    };

    // Only add profileErrors if there are any
    if (profileErrors.length > 0) {
      updateData.profileErrors = profileErrors;
    }

    // Store matches in session
    await updateSession(sessionCode, updateData);

    return {
      matches,
      sessionInfo: {
        code: sessionCode,
        name: session.name,
        participantCount: participantCodes.length,
        profilesLoaded: profiles.length,
        matchesGenerated: matches.length,
      },
      errors: profileErrors,
    };
  } catch (error) {
    console.error(`Error computing matches for session ${sessionCode}:`, error);
    throw error;
  }
}

/**
 * Get matches for a session (retrieve from stored data)
 * @param {string} sessionCode - Session code
 * @returns {Promise<Object>} Stored matches and session info
 */
async function getSessionMatches(sessionCode) {
  try {
    const session = await getSessionByCode(sessionCode);

    if (!session.matches) {
      return {
        matches: [],
        sessionInfo: {
          code: sessionCode,
          name: session.name,
          status: session.status || "waiting",
          message: "No matches computed yet. Run matching first.",
        },
      };
    }

    return {
      matches: session.matches,
      sessionInfo: {
        code: sessionCode,
        name: session.name,
        status: session.status,
        matchingCompletedAt: session.matchingCompletedAt,
        participantCount: session.participants?.length || 0,
      },
      errors: session.profileErrors || [],
    };
  } catch (error) {
    console.error(`Error getting session matches for ${sessionCode}:`, error);
    throw error;
  }
}

module.exports = {
  buildTasteProfile,
  calculateCompatibility,
  calculateCosineSimilarity,
  cosineSimilarity,
  jaccardSimilarity,
  storeTasteProfile,
  getCachedTasteProfile,
  getUserByCode,
  getSessionByCode,
  updateSession,
  computeMatches,
  getSessionMatches,
};
