/*
 * ======= • ======= • ======= • ======= • =======• =======
 * AniKotoAPI — search.controller.js
 * Repository: https://github.com/gaurav2310a/AnikotoAPI_Clone
 *
 * @description
 *   Controller for search functionality. Provides both full search
 *   results with pagination and lightweight autocomplete suggestions.
 *   Both endpoints require a 'keyword' query parameter.
 *
 * @exports
 *   getSearchResults - Express route handler for GET /api/search
 *   getSearchSuggestions - Express route handler for GET /api/search/suggest
 *
 * @author  Gaurav
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

import { extractSearchResults, extractSearchSuggestions } from "../extractors/search.extractor.js";
import { getCache, setCache, TTL } from "../helper/cache.helper.js";
import { addPaginationMeta } from "../helper/pagination.helper.js";

// ══════════════════════════════════════════════════════════════
// CONTROLLER: SEARCH RESULTS
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Full search results endpoint ----
/**
 * Handles GET /api/search requests with keyword and optional page.
 * Returns paginated search results from the source site.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Sends JSON response with search results
 *
 * @example
 *   GET /api/search?keyword=naruto&page=2
 *   Response: { success: true, results: { anime, ... } }
 *
 * @throws {400} If 'keyword' query parameter is missing
 */
const getSearchResults = async (req, res, next) => {
  try {
    const { keyword, page = 1 } = req.query;
    if (!keyword) {
      return res.status(400).json({ success: false, message: "Keyword is required" });
    }
    const cacheKey = `search_${keyword}_${page}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, results: cached });
    }
    const data = await extractSearchResults(keyword, page);
    const response = addPaginationMeta(data, page);
    setCache(cacheKey, response, TTL.search);
    res.json({ success: true, results: response });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════
// CONTROLLER: SEARCH SUGGESTIONS
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Search autocomplete suggestions endpoint ----
/**
 * Handles GET /api/search/suggest requests for autocomplete.
 * Returns lightweight suggestion list for the given keyword.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Sends JSON response with suggestion list
 *
 * @example
 *   GET /api/search/suggest?keyword=nar
 *   Response: { success: true, results: [{ id, title, ... }] }
 *
 * @throws {400} If 'keyword' query parameter is missing
 */
const getSearchSuggestions = async (req, res, next) => {
  try {
    const { keyword } = req.query;
    if (!keyword) {
      return res.status(400).json({ success: false, message: "Keyword is required" });
    }
    const cacheKey = `search_suggest_${keyword}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, results: cached });
    }
    const data = await extractSearchSuggestions(keyword);
    setCache(cacheKey, data, TTL.search);
    res.json({ success: true, results: data });
  } catch (error) {
    next(error);
  }
};

export { getSearchResults, getSearchSuggestions };

// ══════════════════════════════════════════════════════════════ END: search.controller.js