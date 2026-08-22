/*
 * ======= • ======= • ======= • ======= • =======• =======
 * AniKotoAPI — watchPage.controller.js
 * Repository: https://github.com/gaurav2310a/AnikotoAPI_Clone
 *
 * @description
 *   Controller for the watch page endpoint. Returns episode
 *   details, video player data, and related anime information.
 *   Requires both 'slug' and 'ep' query parameters.
 *
 * @exports
 *   getWatchPage - Express route handler for GET /api/watch
 *
 * @author  Gaurav
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

import { extractWatchPage } from "../extractors/watchPage.extractor.js";
import { getCache, setCache, TTL } from "../helper/cache.helper.js";

// ══════════════════════════════════════════════════════════════
// CONTROLLER: WATCH PAGE
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Watch page data endpoint ----
/**
 * Handles GET /api/watch requests. Returns episode data and
 * player information for the specified anime and episode.
 *
 * @param {object} req - Express request object
 * @param {string} req.query.slug - Anime slug identifier
 * @param {string|number} req.query.ep - Episode number
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Sends JSON response with watch page data
 *
 * @example
 *   GET /api/watch?slug=one-piece&ep=1
 *   Response: { success: true, results: { episode, servers, ... } }
 *
 * @throws {400} If 'slug' or 'ep' query parameters are missing
 * WARNING: Both slug and ep are required or the endpoint returns 500
 */
const getWatchPage = async (req, res, next) => {
  try {
    const { slug, ep } = req.query;
    if (!slug || !ep) {
      return res.status(400).json({ success: false, message: "Slug and episode number are required" });
    }
    const cacheKey = `watch_${slug}_${ep}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, results: cached });
    }
    const data = await extractWatchPage(slug, ep);
    setCache(cacheKey, data, TTL.stream);
    res.json({ success: true, results: data });
  } catch (error) {
    next(error);
  }
};

export { getWatchPage };

// ══════════════════════════════════════════════════════════════ END: watchPage.controller.js