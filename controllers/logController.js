// controllers/logController.js

import Log from "../models/Log.js";

// GET ALL LOGS (MASTER ONLY)
export const getAllLogs = async (req, res) => {
  try {
    const logs = await Log.find().sort({ date: -1, time: -1 });
    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};


// GET LOGS WITH FILTER (FOR MANAGER & SALESMAN)
export const filterLogs = async (req, res) => {
  try {
    const { role, user_id, segment, filterSegment, result, startDate, endDate } = req.body;

    let query = {};

    // ROLE BASED FILTER
    if (role === "Salesman") {
      query.user_id = user_id;
    }

    if (role === "Manager") {
      query.segment = segment.toUpperCase();
    }

    // FILTER PAGE → SEGMENT
    if (filterSegment && filterSegment !== "All") {
      query.segment = filterSegment.toUpperCase();
    }

    // FILTER PAGE → RESULT
    if (result && result !== "All") {
      query.result = result.toLowerCase();
    }

    let logs = await Log.find(query);

    // DATE RANGE FILTER
    if (startDate || endDate) {
      logs = logs.filter(l => {
        const [d, m, y] = l.date.split("-");
        const logDate = new Date(`${y}-${m}-${d}`);
        if (startDate && logDate < new Date(startDate)) return false;
        if (endDate && logDate > new Date(endDate)) return false;
        return true;
      });
    }

    return res.json(logs);

  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};
