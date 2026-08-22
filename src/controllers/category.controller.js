/*
 * ======= • ======= • ======= • ======= • =======• =======
 * AniKotoAPI — category.controller.js
 * Repository: https://github.com/gaurav2310a/AnikotoAPI_Clone
 *
 * @description
 *   Controller for category-based anime filtering. Handles genre,
 *   type, and status categories with a unified endpoint. The
 *   category path is set by the route before reaching this controller.
 *
 * @exports
 *   getCategory - Express route handler for category endpoints
 *
 * @author  Gaurav
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

import { extractCategory } from "../extractors/category.extractor.js";
import { getCache, setCache, TTL } from "../helper/cache.helper.js";
import { addPaginationMeta } from "../helper/pagination.helper.js";

// ══════════════════════════════════════════════════════════════
// CONTROLLER: CATEGORY
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Category-based anime filtering endpoint ----
/**
 * Handles category-based requests for genre, type, and status
 * filtering. Returns paginated anime list for the given category.
 *
 * @param {object} req - Express request object
 * @param {string} req.params.category - Category path (e.g., "genre/action")
 * @param {number} req.query.page - Page number (default: 1)
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Sends JSON response with category-filtered anime
 *
 * @example
 *   GET /api/genre/action?page=2
 *   Response: { success: true, results: { anime, pagination, ... } }
 *
 * @throws {400} If category parameter is missing
 * NOTE: The category param is set by the route middleware before this controller
 */
const getCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { page = 1 } = req.query;
    if (!category) {
      return res.status(400).json({ success: false, message: "Category is required" });
    }
    const cacheKey = `category_${category}_${page}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, results: cached });
    }
    const data = await extractCategory(category, page);
    const response = addPaginationMeta(data, page);
    setCache(cacheKey, response, TTL.genres);
    res.json({ success: true, results: response });
  } catch (error) {
    next(error);
  }
};

export { getCategory };

// ══════════════════════════════════════════════════════════════ END: category.controller.js