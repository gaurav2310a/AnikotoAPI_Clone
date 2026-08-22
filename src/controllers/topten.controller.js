/*
 * ======= • ======= • ======= • ======= • =======• =======
 * AniKotoAPI — topten.controller.js
 * Repository: https://github.com/gaurav2310a/AnikotoAPI_Clone
 *
 * @description
 *   Controller for top 10 ranked anime. Returns the current top 10
 *   anime list from the source site. No parameters required.
 *
 * @exports
 *   getTopTen - Express route handler for GET /api/top-ten
 *
 * @author  Gaurav
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

import { extractTopTen } from "../extractors/topten.extractor.js";
import { getCache, setCache, TTL } from "../helper/cache.helper.js";

// ══════════════════════════════════════════════════════════════
// CONTROLLER: TOP TEN
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Top 10 anime endpoint ----
/**
 * Handles GET /api/top-ten requests. Returns the current top 10
 * ranked anime from the source site.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Sends JSON response with top 10 anime list
 *
 * @example
 *   GET /api/top-ten
 *   Response: { success: true, results: [{ rank, title, ... }] }
 */
const getTopTen = async (req, res, next) => {
  try {
    const cacheKey = "topTen";
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, results: cached });
    }
    const data = await extractTopTen();
    setCache(cacheKey, data, TTL.default);
    res.json({ success: true, results: data });
  } catch (error) {
    next(error);
  }
};

export { getTopTen };

// ══════════════════════════════════════════════════════════════ END: topten.controller.js