/*
 * ======= • ======= • ======= • ======= • =======• =======
 * AniKotoAPI — newRelease.controller.js
 * Repository: https://github.com/gaurav2310a/AnikotoAPI_Clone
 *
 * @description
 *   Controller for new release and newly added anime. Provides
 *   two endpoints: one for recently released episodes and one
 *   for newly added anime series. Both support pagination.
 *
 * @exports
 *   getNewRelease - Express route handler for GET /api/new-release
 *   getNewlyAdded - Express route handler for GET /api/newly-added
 *
 * @author  Gaurav
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

import { extractNewRelease, extractNewlyAdded, extractLatestUpdated } from "../extractors/newRelease.extractor.js";
import { getCache, setCache, TTL } from "../helper/cache.helper.js";
import { addPaginationMeta } from "../helper/pagination.helper.js";

// ══════════════════════════════════════════════════════════════
// CONTROLLER: NEW RELEASE
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Recently released episodes endpoint ----
/**
 * Handles GET /api/new-release requests. Returns paginated list
 * of recently released anime episodes.
 *
 * @param {object} req - Express request object
 * @param {number} req.query.page - Page number (default: 1)
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Sends JSON response with new release episodes
 *
 * @example
 *   GET /api/new-release?page=2
 *   Response: { success: true, results: { episodes, pagination, ... } }
 */
const getNewRelease = async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    const cacheKey = `newrelease_${page}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, results: cached });
    }
    const data = await extractNewRelease(page);
    const response = addPaginationMeta(data, page);
    setCache(cacheKey, response, TTL.default);
    res.json({ success: true, results: response });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════
// CONTROLLER: NEWLY ADDED
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Newly added anime series endpoint ----
/**
 * Handles GET /api/newly-added requests. Returns paginated list
 * of newly added anime series to the platform.
 *
 * @param {object} req - Express request object
 * @param {number} req.query.page - Page number (default: 1)
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Sends JSON response with newly added anime
 *
 * @example
 *   GET /api/newly-added?page=3
 *   Response: { success: true, results: { anime, pagination, ... } }
 */
const getNewlyAdded = async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    const cacheKey = `newlyadded_${page}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, results: cached });
    }
    const data = await extractNewlyAdded(page);
    const response = addPaginationMeta(data, page);
    setCache(cacheKey, response, TTL.default);
    res.json({ success: true, results: response });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════
// CONTROLLER: LATEST UPDATED
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Latest Updated Endpoint ----
/**
 * Handles GET /api/latest-updated requests. Returns paginated list
 * of recently updated anime sorted by last update time.
 *
 * @param {object} req - Express request object
 * @param {number} req.query.page - Page number (default: 1)
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Sends JSON response with latest updated anime
 *
 * @example
 *   GET /api/latest-updated?page=2
 *   Response: { success: true, results: { totalPages, data[] } }
 */
const getLatestUpdated = async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    const cacheKey = `latestupdated_${page}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, results: cached });
    }
    const data = await extractLatestUpdated(page);
    const response = addPaginationMeta(data, page);
    setCache(cacheKey, response, TTL.default);
    res.json({ success: true, results: response });
  } catch (error) {
    next(error);
  }
};

export { getNewRelease, getNewlyAdded, getLatestUpdated };

// ══════════════════════════════════════════════════════════════ END: newRelease.controller.js