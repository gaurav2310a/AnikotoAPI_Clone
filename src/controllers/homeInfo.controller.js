/*
 * ======= • ======= • ======= • ======= • =======• =======
 * AniKotoAPI — homeInfo.controller.js
 * Repository: https://github.com/gaurav2310a/AnikotoAPI_Clone
 *
 * @description
 *   Controller for the homepage data endpoint. Extracts featured
 *   anime, spotlight, trending, and other homepage sections.
 *   Uses in-memory caching to avoid repeated scraping.
 *
 * @exports
 *   getHomeInfo - Express route handler for GET /api/
 *
 * @author  Gaurav
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

import { extractHomeInfo } from "../extractors/homeInfo.extractor.js";
import { getCache, setCache, TTL } from "../helper/cache.helper.js";

// ══════════════════════════════════════════════════════════════
// CONTROLLER: HOME INFO
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Homepage data endpoint ----
/**
 * Handles GET /api/ requests by extracting homepage data
 * from the source site. Returns cached data if available.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @example
 *   GET /api/
 *   Response: { success: true, results: { spotlight, trending, ... } }
 */
const getHomeInfo = async (req, res, next) => {
  try {
    const cacheKey = "home";
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, results: cached });
    }
    const data = await extractHomeInfo();
    setCache(cacheKey, data, TTL.home);
    res.json({ success: true, results: data });
  } catch (error) {
    next(error);
  }
};

export { getHomeInfo };

// ══════════════════════════════════════════════════════════════ END: homeInfo.controller.js