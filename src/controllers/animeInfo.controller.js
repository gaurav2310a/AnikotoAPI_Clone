/*
 * ======= • ======= • ======= • ======= • =======• =======
 * AniKotoAPI — animeInfo.controller.js
 * Repository: https://github.com/gaurav2310a/AnikotoAPI_Clone
 *
 * @description
 *   Controller for anime detail information. Extracts full anime
 *   metadata including title, synopsis, episodes, genres, etc.
 *   Requires an anime slug as query parameter.
 *
 * @exports
 *   getAnimeInfo - Express route handler for GET /api/info
 *
 * @author  Gaurav
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

import { extractAnimeInfo } from "../extractors/animeInfo.extractor.js";
import { getCache, setCache, TTL } from "../helper/cache.helper.js";

// ══════════════════════════════════════════════════════════════
// CONTROLLER: ANIME INFO
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Anime detail information endpoint ----
/**
 * Handles GET /api/info requests by extracting detailed anime
 * information from the source site. Requires 'id' query param.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Sends JSON response with anime details
 *
 * @example
 *   GET /api/info?id=one-piece
 *   Response: { success: true, results: { title, synopsis, ... } }
 *
 * @throws {400} If 'id' query parameter is missing
 */
const getAnimeInfo = async (req, res, next) => {
  try {
    const { id, slug } = req.query;
    // NOTE: Accept both ?id= and ?slug= for backwards compatibility
    const animeSlug = id || slug;
    if (!animeSlug) {
      return res.status(400).json({ success: false, message: "Anime slug is required (?id= or ?slug=)" });
    }
    const cacheKey = `anime_${animeSlug}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, results: cached });
    }
    const data = await extractAnimeInfo(animeSlug);
    setCache(cacheKey, data, TTL.info);
    res.json({ success: true, results: data });
  } catch (error) {
    next(error);
  }
};

export { getAnimeInfo };

// ══════════════════════════════════════════════════════════════ END: animeInfo.controller.js