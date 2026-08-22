/*
 * ======= • ======= • ======= • ======= • =======• =======
 * AniKotoAPI — completedAnime.controller.js
 * Repository: https://github.com/gaurav2310a/AnikotoAPI_Clone
 *
 * @description
 *   Controller for completed anime section. Returns list of anime
 *   that have finished airing from the homepage.
 *
 * @exports
 *   getCompletedAnime - Express route handler for GET /api/completed
 *
 * @author  Gaurav
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

import { extractCompletedAnime } from "../extractors/completedAnime.extractor.js";
import { getCache, setCache, TTL } from "../helper/cache.helper.js";

// ══════════════════════════════════════════════════════════════
// CONTROLLER: COMPLETED ANIME
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Completed anime endpoint ----
/**
 * Handles GET /api/completed requests. Returns list of anime
 * that have finished airing from the homepage section.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Sends JSON response with completed anime list
 *
 * @example
 *   GET /api/completed
 *   Response: { success: true, results: [...], ... }
 */
const getCompletedAnime = async (req, res, next) => {
  try {
    const cacheKey = "completed";
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, results: cached });
    }
    const data = await extractCompletedAnime();
    setCache(cacheKey, data, TTL.default);
    res.json({ success: true, results: data });
  } catch (error) {
    next(error);
  }
};

export { getCompletedAnime };

// ══════════════════════════════════════════════════════════════ END: completedAnime.controller.js
