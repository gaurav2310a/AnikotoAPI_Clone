/*
 * ======= • ======= • ======= • ======= • =======• =======
 * AniKotoAPI — spotlight.controller.js
 * Repository: https://github.com/gaurav2310a/AnikotoAPI_Clone
 *
 * @description
 *   Controller for spotlight/featured anime carousel data.
 *   Returns a list of featured anime with banners and descriptions.
 *   No parameters required - returns fixed spotlight content.
 *
 * @exports
 *   getSpotlight - Express route handler for GET /api/spotlight
 *
 * @author  Gaurav
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

import { extractSpotlight } from "../extractors/spotlight.extractor.js";
import { getCache, setCache, TTL } from "../helper/cache.helper.js";

// ══════════════════════════════════════════════════════════════
// CONTROLLER: SPOTLIGHT
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Spotlight carousel endpoint ----
/**
 * Handles GET /api/spotlight requests. Returns featured anime
 * data for the homepage spotlight carousel.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Sends JSON response with spotlight anime list
 *
 * @example
 *   GET /api/spotlight
 *   Response: { success: true, results: [{ title, banner, ... }] }
 */
const getSpotlight = async (req, res, next) => {
  try {
    const cacheKey = "spotlight";
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, results: cached });
    }
    const data = await extractSpotlight();
    setCache(cacheKey, data, TTL.spotlight);
    res.json({ success: true, results: data });
  } catch (error) {
    next(error);
  }
};

export { getSpotlight };

// ══════════════════════════════════════════════════════════════ END: spotlight.controller.js