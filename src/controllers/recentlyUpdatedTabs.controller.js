/*
 * ======= • ======= • ======= • ======= • =======• =======
 * AniKotoAPI — recentlyUpdatedTabs.controller.js
 * Repository: https://github.com/gaurav2310a/AnikotoAPI_Clone
 *
 * @description
 *   Controller for recently updated anime with tab filtering.
 *   Returns recently updated anime filtered by all, dub, or sub.
 *
 * @exports
 *   getRecentlyUpdatedTabs - Express route handler for GET /api/recently-updated
 *
 * @author  Gaurav
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

import { extractRecentlyUpdatedTabs } from "../extractors/recentlyUpdatedTabs.extractor.js";
import { getCache, setCache, TTL } from "../helper/cache.helper.js";

// ══════════════════════════════════════════════════════════════
// CONTROLLER: RECENTLY UPDATED TABS
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Recently updated with tab filtering endpoint ----
/**
 * Handles GET /api/recently-updated requests. Returns recently updated
 * anime filtered by tab: all, dub, or sub.
 *
 * @param {object} req - Express request object
 * @param {string} [req.query.tab="all"] - Tab filter: "all", "dub", or "sub"
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Sends JSON response with recently updated anime list
 *
 * @example
 *   GET /api/recently-updated?tab=dub
 *   Response: { success: true, results: [...], tab: "dub" }
 */
const getRecentlyUpdatedTabs = async (req, res, next) => {
  try {
    const { tab = "all" } = req.query;
    const cacheKey = `recently_updated_${tab}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, results: cached, tab });
    }
    const data = await extractRecentlyUpdatedTabs(tab);
    setCache(cacheKey, data, TTL.default);
    res.json({ success: true, results: data, tab });
  } catch (error) {
    next(error);
  }
};

export { getRecentlyUpdatedTabs };

// ══════════════════════════════════════════════════════════════ END: recentlyUpdatedTabs.controller.js
