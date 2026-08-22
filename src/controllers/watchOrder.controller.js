/*
 * ======= • ======= • ======= • ======= • =======• =======
 * AniKotoAPI — watchOrder.controller.js
 * Repository: https://github.com/gaurav2310a/AnikotoAPI_Clone
 *
 * @description
 *   Controller for recommended watch order. Returns the optimal
 *   viewing order for anime with multiple seasons, movies, and OVAs.
 *   Requires an anime ID as a route parameter.
 *
 * @exports
 *   getWatchOrder - Express route handler for GET /api/watch-order/:id
 *
 * @author  Gaurav
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

import { extractWatchOrder } from "../extractors/watchOrder.extractor.js";
import { getCache, setCache, TTL } from "../helper/cache.helper.js";

// ══════════════════════════════════════════════════════════════
// CONTROLLER: WATCH ORDER
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Recommended watch order endpoint ----
/**
 * Handles GET /api/watch-order/:id requests. Returns recommended
 * viewing order for the specified anime franchise.
 *
 * @param {object} req - Express request object
 * @param {string} req.params.id - Anime ID
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Sends JSON response with watch order data
 *
 * @example
 *   GET /api/watch-order/12345
 *   Response: { success: true, results: [{ order, title, ... }] }
 *
 * @throws {400} If anime ID is not provided
 * TIP: Useful for anime franchises with complex viewing orders
 */
const getWatchOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Anime ID is required" });
    }
    const cacheKey = `watchorder_${id}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, results: cached });
    }
    const data = await extractWatchOrder(id);
    setCache(cacheKey, data, TTL.default);
    res.json({ success: true, results: data });
  } catch (error) {
    next(error);
  }
};

export { getWatchOrder };

// ══════════════════════════════════════════════════════════════ END: watchOrder.controller.js