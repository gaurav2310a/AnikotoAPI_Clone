/*
 * ======= • ======= • ======= • ======= • =======• =======
 * AniKotoAPI — trending.controller.js
 * Repository: https://github.com/gaurav2310a/AnikotoAPI_Clone
 *
 * @description
 *   Controller for currently trending anime data. Returns a list
 *   of anime that are currently popular/trending on the source site.
 *   No parameters required - returns fixed trending content.
 *
 * @exports
 *   getTrending - Express route handler for GET /api/trending
 *
 * @author  Gaurav
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

import { extractTrending } from "../extractors/trending.extractor.js";
import { getCache, setCache, TTL } from "../helper/cache.helper.js";

// ══════════════════════════════════════════════════════════════
// CONTROLLER: TRENDING
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Trending anime endpoint ----
/**
 * Handles GET /api/trending requests. Returns currently trending
 * anime from the source site.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Sends JSON response with trending anime list
 *
 * @example
 *   GET /api/trending
 *   Response: { success: true, results: [{ title, rank, ... }] }
 */
const getTrending = async (req, res, next) => {
  try {
    const cacheKey = "trending";
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, results: cached });
    }
    const data = await extractTrending();
    setCache(cacheKey, data, TTL.trending);
    res.json({ success: true, results: data });
  } catch (error) {
    next(error);
  }
};

export { getTrending };

// ══════════════════════════════════════════════════════════════ END: trending.controller.js