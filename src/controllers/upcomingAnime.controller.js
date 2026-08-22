/*
 * ======= • ======= • ======= • ======= • =======• =======
 * AniKotoAPI — upcomingAnime.controller.js
 * Repository: https://github.com/gaurav2310a/AnikotoAPI_Clone
 *
 * @description
 *   Controller for upcoming anime section. Returns list of anime
 *   scheduled for future release from the homepage.
 *
 * @exports
 *   getUpcomingAnime - Express route handler for GET /api/upcoming
 *
 * @author  Gaurav
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

import { extractUpcomingAnime } from "../extractors/upcomingAnime.extractor.js";
import { getCache, setCache, TTL } from "../helper/cache.helper.js";

// ══════════════════════════════════════════════════════════════
// CONTROLLER: UPCOMING ANIME
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Upcoming anime endpoint ----
/**
 * Handles GET /api/upcoming requests. Returns list of anime
 * scheduled for future release from the homepage section.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Sends JSON response with upcoming anime list
 *
 * @example
 *   GET /api/upcoming
 *   Response: { success: true, results: [...], ... }
 */
const getUpcomingAnime = async (req, res, next) => {
  try {
    const cacheKey = "upcoming";
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, results: cached });
    }
    const data = await extractUpcomingAnime();
    setCache(cacheKey, data, TTL.default);
    res.json({ success: true, results: data });
  } catch (error) {
    next(error);
  }
};

export { getUpcomingAnime };

// ══════════════════════════════════════════════════════════════ END: upcomingAnime.controller.js
