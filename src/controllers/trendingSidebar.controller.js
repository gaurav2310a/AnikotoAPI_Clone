/*
 * ======= • ======= • ======= • ======= • =======• =======
 * AniKotoAPI — trendingSidebar.controller.js
 * Repository: https://github.com/gaurav2310a/AnikotoAPI_Clone
 *
 * @description
 *   Controller for trending sidebar widget data. Returns trending
 *   anime data formatted for sidebar display. No parameters required.
 *
 * @exports
 *   getTrendingSidebar - Express route handler for GET /api/trending-sidebar
 *
 * @author  Gaurav
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

import { extractTrendingSidebar } from "../extractors/trendingSidebar.extractor.js";
import { getCache, setCache, TTL } from "../helper/cache.helper.js";

// ══════════════════════════════════════════════════════════════
// CONTROLLER: TRENDING SIDEBAR
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Trending sidebar widget endpoint ----
/**
 * Handles GET /api/trending-sidebar requests. Returns trending
 * anime data formatted for sidebar display.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Sends JSON response with trending sidebar data
 *
 * @example
 *   GET /api/trending-sidebar
 *   Response: { success: true, results: [{ title, rank, ... }] }
 */
const getTrendingSidebar = async (req, res, next) => {
  try {
    const cacheKey = "trendingSidebar";
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, results: cached });
    }
    const data = await extractTrendingSidebar();
    setCache(cacheKey, data, TTL.trending);
    res.json({ success: true, results: data });
  } catch (error) {
    next(error);
  }
};

export { getTrendingSidebar };

// ══════════════════════════════════════════════════════════════ END: trendingSidebar.controller.js