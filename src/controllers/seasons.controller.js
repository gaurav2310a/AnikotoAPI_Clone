/*
 * ======= • ======= • ======= • ======= • =======• =======
 * AniKotoAPI — seasons.controller.js
 * Repository: https://github.com/gaurav2310a/AnikotoAPI_Clone
 *
 * @description
 *   Controller for anime season information. Returns season data
 *   for a specific anime including related seasons and episodes.
 *   Requires an anime ID as a route parameter.
 *
 * @exports
 *   getSeasons - Express route handler for GET /api/seasons/:id
 *
 * @author  Gaurav
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

import { extractSeasons } from "../extractors/seasons.extractor.js";
import { getCache, setCache, TTL } from "../helper/cache.helper.js";

// ══════════════════════════════════════════════════════════════
// CONTROLLER: SEASONS
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Anime seasons endpoint ----
/**
 * Handles GET /api/seasons/:id requests. Returns season information
 * for the specified anime.
 *
 * @param {object} req - Express request object
 * @param {string} req.params.id - Anime ID
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Sends JSON response with season data
 *
 * @example
 *   GET /api/seasons/12345
 *   Response: { success: true, results: { seasons, ... } }
 *
 * @throws {400} If anime ID is not provided
 */
const getSeasons = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Anime ID is required" });
    }
    const cacheKey = `seasons_${id}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, results: cached });
    }
    const data = await extractSeasons(id);
    setCache(cacheKey, data, TTL.default);
    res.json({ success: true, results: data });
  } catch (error) {
    next(error);
  }
};

export { getSeasons };

// ══════════════════════════════════════════════════════════════ END: seasons.controller.js