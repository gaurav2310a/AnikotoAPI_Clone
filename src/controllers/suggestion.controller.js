/*
 * ======= • ======= • ======= • ======= • =======• =======
 * AniKotoAPI — suggestion.controller.js
 * Repository: https://github.com/gaurav2310a/AnikotoAPI_Clone
 *
 * @description
 *   Controller for anime suggestions/autocomplete. Returns a list
 *   of anime matching the given keyword for autocomplete features.
 *   Requires a 'keyword' query parameter.
 *
 * @exports
 *   getSuggestions - Express route handler for GET /api/suggestions
 *
 * @author  Gaurav
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

import { extractSuggestions } from "../extractors/suggestion.extractor.js";
import { getCache, setCache, TTL } from "../helper/cache.helper.js";

// ══════════════════════════════════════════════════════════════
// CONTROLLER: SUGGESTIONS
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Anime suggestions endpoint ----
/**
 * Handles GET /api/suggestions requests. Returns autocomplete
 * suggestions based on the provided keyword.
 *
 * @param {object} req - Express request object
 * @param {string} req.query.keyword - Search keyword for suggestions
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Sends JSON response with suggestion list
 *
 * @example
 *   GET /api/suggestions?keyword=naru
 *   Response: { success: true, results: [{ id, title, ... }] }
 *
 * @throws {400} If 'keyword' query parameter is missing
 */
const getSuggestions = async (req, res, next) => {
  try {
    const { keyword } = req.query;
    if (!keyword) {
      return res.status(400).json({ success: false, message: "Keyword is required" });
    }
    const cacheKey = `suggest_${keyword}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, results: cached });
    }
    const data = await extractSuggestions(keyword);
    setCache(cacheKey, data, TTL.suggestions);
    res.json({ success: true, results: data });
  } catch (error) {
    next(error);
  }
};

export { getSuggestions };

// ══════════════════════════════════════════════════════════════ END: suggestion.controller.js