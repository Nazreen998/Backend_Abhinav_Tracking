import Log from "../models/Log.js";

// MASTER → ALL LOGS
export const getAllLogs = async (req, res) => {
  try {
    const logs = await Log.find().sort({ date: -1, time: -1 });
    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// UNIVERSAL FILTER (Salesman + Manager + Master)
export const filterLogs = async (req, res) => {
  try {
    const { role, user_id, segment, filterSegment, result, startDate, endDate } = req.body;

    let query = {};

    // 🔥 ROLE BASE FILTER
    if (role === "salesman") {
      query.user_id = user_id;  // salesman → own logs only
    }

    if (role === "manager") {
      query.segment = segment.toLowerCase(); // manager → own segment logs only
    }

    if (role === "master") {
      // master → no log restriction
    }

    // 🔥 FILTER PAGE → SEGMENT (MASTER ONLY)
    if (role === "master" && filterSegment && filterSegment !== "All") {
      query.segment = filterSegment.toLowerCase();
    }

    // 🔥 FILTER PAGE → RESULT
    if (result && result !== "All") {
      query.result = result.toLowerCase();
    }

    // NORMALIZE QUERY to lowercase
    if (query.segment) query.segment = query.segment.toLowerCase();

    let logs = await Log.find(query);

    // 🔥 DATE RANGE FILTER
    if (startDate || endDate) {
      logs = logs.filter(l => {
        const parts = l.date.includes("-")
          ? l.date.split("-")
          : l.date.split("/");

        const [d, m, y] = parts;
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
