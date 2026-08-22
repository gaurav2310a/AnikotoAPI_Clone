/*
 * ======= • ======= • ======= • ======= • =======• =======
 * AniKotoAPI — download.controller.js
 * Repository: https://github.com/gaurav2310a/AnikotoAPI_Clone
 *
 * @description
 *   Controller for download links endpoint. Returns streaming server
 *   URLs for downloading anime episodes.
 *
 * @exports
 *   getDownloadLinks - Express route handler for GET /api/download
 *
 * @author  Gaurav
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

import { extractDownloadLinks } from "../extractors/download.extractor.js";
import { getCache, setCache, TTL } from "../helper/cache.helper.js";

// ══════════════════════════════════════════════════════════════
// DOWNLOAD LINKS HANDLER
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Download Links ----
/**
 * Handles GET /api/download requests. Returns download links
 * for the specified anime episode.
 *
 * @param {object} req - Express request object
 * @param {string} req.query.slug - Anime slug (required)
 * @param {number} req.query.ep - Episode number (required)
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Sends JSON response with download links
 *
 * @example
 *   GET /api/download?slug=naruto-shippuden-c8gov&ep=1
 *   Response: { success: true, results: { slug, episode, downloads[] } }
 */
const getDownloadLinks = async (req, res, next) => {
  try {
    const { slug, ep } = req.query;
    if (!slug || !ep) {
      return res.status(400).json({ 
        success: false, 
        message: "Both slug and ep parameters are required" 
      });
    }

    const cacheKey = `download_${slug}_${ep}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, results: cached });
    }

    const data = await extractDownloadLinks(slug, parseInt(ep));
    setCache(cacheKey, data, TTL.stream);
    res.json({ success: true, results: data });
  } catch (error) {
    next(error);
  }
};

export { getDownloadLinks };
// ══════════════════════════════════════════════════════════════ END: download.controller.js
