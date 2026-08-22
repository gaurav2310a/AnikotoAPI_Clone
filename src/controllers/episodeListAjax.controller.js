/*
 * ======= • ======= • ======= • ======= • =======• =======
 * AniKotoAPI — episodeListAjax.controller.js
 * Repository: https://github.com/gaurav2310a/AnikotoAPI_Clone
 *
 * @description
 *   Controller for AJAX-loaded episode list data. Provides additional
 *   episode metadata that may not be available in the standard episode
 *   list endpoint. Supports style and VRF query parameters.
 *
 * @exports
 *   getEpisodeListAjax - Express route handler for GET /api/episodes-ajax/:id
 *
 * @author  Gaurav
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

import { extractEpisodeListAjax } from "../extractors/episodeListAjax.extractor.js";
import { getCache, setCache, TTL } from "../helper/cache.helper.js";

// ══════════════════════════════════════════════════════════════
// CONTROLLER: EPISODE LIST AJAX
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: AJAX episode list endpoint ----
/**
 * Handles GET /api/episodes-ajax/:id requests. Returns additional
 * episode data loaded via AJAX from the source site.
 *
 * @param {object} req - Express request object
 * @param {object} req.params.id - Anime ID
 * @param {string} req.query.style - Optional display style parameter
 * @param {string} req.query.vrf - Optional VRF verification token
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Sends JSON response with AJAX episode data
 *
 * @example
 *   GET /api/episodes-ajax/12345?style=0&vrf=abc123
 *   Response: { success: true, results: [...] }
 *
 * @throws {400} If anime ID is not provided
 * NOTE: The style and vrf params affect the response format
 */
const getEpisodeListAjax = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { style, vrf } = req.query;
    if (!id) {
      return res.status(400).json({ success: false, message: "Anime ID is required" });
    }
    const cacheKey = `episodes_ajax_${id}_${style || ""}_${vrf || ""}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, results: cached });
    }
    const data = await extractEpisodeListAjax(id, style, vrf);
    setCache(cacheKey, data, TTL.episodes);
    res.json({ success: true, results: data });
  } catch (error) {
    next(error);
  }
};

export { getEpisodeListAjax };

// ══════════════════════════════════════════════════════════════ END: episodeListAjax.controller.js