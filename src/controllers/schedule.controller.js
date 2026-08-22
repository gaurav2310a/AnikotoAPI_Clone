/*
 * ======= • ======= • ======= • ======= • =======• =======
 * AniKotoAPI — schedule.controller.js
 * Repository: https://github.com/gaurav2310a/AnikotoAPI_Clone
 *
 * @description
 *   Controller for anime airing schedule. Returns anime episodes
 *   scheduled to air on a specific date. Requires date in
 *   YYYY-MM-DD format as a query parameter.
 *
 * @exports
 *   getSchedule - Express route handler for GET /api/schedule
 *
 * @author  Gaurav
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

import { extractSchedule } from "../extractors/schedule.extractor.js";
import { getCache, setCache, TTL } from "../helper/cache.helper.js";

// ══════════════════════════════════════════════════════════════
// CONTROLLER: SCHEDULE
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Anime airing schedule endpoint ----
/**
 * Handles GET /api/schedule requests. Returns anime episodes
 * scheduled for the specified date.
 *
 * @param {object} req - Express request object
 * @param {string} req.query.date - Date in YYYY-MM-DD format
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Sends JSON response with schedule data
 *
 * @example
 *   GET /api/schedule?date=2024-01-15
 *   Response: { success: true, results: [{ time, title, ... }] }
 *
 * @throws {400} If 'date' query parameter is missing
 * NOTE: Date must be in YYYY-MM-DD format
 */
const getSchedule = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required (YYYY-MM-DD)" });
    }
    const cacheKey = `schedule_${date}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, results: cached });
    }
    const data = await extractSchedule(date);
    setCache(cacheKey, data, TTL.schedule);
    res.json({ success: true, results: data });
  } catch (error) {
    next(error);
  }
};

export { getSchedule };

// ══════════════════════════════════════════════════════════════ END: schedule.controller.js