/*
 * ======= • ======= • ======= • ======= • =======• =======
 * AniKotoAPI — episodeList.controller.js
 * Repository: https://github.com/gaurav2310a/AnikotoAPI_Clone
 *
 * @description
 *   Controller for fetching the episode list of a specific anime.
 *   Returns all available episodes with their numbers and titles.
 *   Requires an anime ID as a route parameter.
 *
 * @exports
 *   getEpisodeList - Express route handler for GET /api/episodes/:id
 *
 * @author  Gaurav
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

import { extractEpisodeList } from "../extractors/episodeList.extractor.js";
import { getCache, setCache, TTL } from "../helper/cache.helper.js";

// ══════════════════════════════════════════════════════════════
// CONTROLLER: EPISODE LIST
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Episode list endpoint ----
/**
 * Handles GET /api/episodes/:id requests. Extracts the full
 * episode list for the specified anime from the source site.
 *
 * @param {object} req - Express request object
 * @param {object} req.params.id - Anime ID/slug
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Sends JSON response with episode list
 *
 * @example
 *   GET /api/episodes/one-piece
 *   Response: { success: true, results: [{ number, title, ... }] }
 *
 * @throws {400} If anime ID is not provided
 */
const getEpisodeList = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Anime slug is required" });
    }
    const cacheKey = `episodes_${id}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, results: cached });
    }
    const data = await extractEpisodeList(id);
    setCache(cacheKey, data, TTL.episodes);
    res.json({ success: true, results: data });
  } catch (error) {
    next(error);
  }
};

export { getEpisodeList };

// ══════════════════════════════════════════════════════════════ END: episodeList.controller.js