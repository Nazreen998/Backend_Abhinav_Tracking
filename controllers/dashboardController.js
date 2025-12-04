// controllers/dashboardController.js

import Log from "../models/Log.js";
import AssignedShop from "../models/AssignedShop.js";
import User from "../models/User.js";

// Helper: get today's date (DD-MM-YYYY)
const todayDate = () => new Date().toLocaleDateString("en-GB");

// Helper: get last 7 days date list
const getLast7Days = () => {
  const arr = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    arr.push(d.toLocaleDateString("en-GB"));
  }
  return arr;
};


// ======================
// MASTER DASHBOARD
// ======================
export const masterDashboard = async (req, res) => {
  try {
    const today = todayDate();
    const last7 = getLast7Days();

    // Today Stats
    const todayLogs = await Log.find({ date: today });

    // Week Stats
    const weekLogs = await Log.find({ date: { $in: last7 } });

    // Salesman performance (group by salesman)
    const salesmanPerformance = await Log.aggregate([
      {
        $group: {
          _id: "$salesman",
          visits: { $sum: 1 }
        }
      },
      { $sort: { visits: -1 } }
    ]);

    return res.json({
      status: "success",
      today: todayLogs.length,
      week: weekLogs.length,
      match_today: todayLogs.filter(l => l.result === "match").length,
      mismatch_today: todayLogs.filter(l => l.result === "mismatch").length,
      salesman_performance: salesmanPerformance,
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};


// ======================
// MANAGER DASHBOARD
// ======================
export const managerDashboard = async (req, res) => {
  try {
    const { segment } = req.params;

    const today = todayDate();
    const last7 = getLast7Days();

    const todayLogs = await Log.find({ date: today, segment });
    const weekLogs = await Log.find({ date: { $in: last7 }, segment });

    const performance = await Log.aggregate([
      { $match: { segment } },
      {
        $group: {
          _id: "$salesman",
          visits: { $sum: 1 }
        }
      },
      { $sort: { visits: -1 } }
    ]);

    return res.json({
      status: "success",
      segment,
      today: todayLogs.length,
      week: weekLogs.length,
      salesman_performance: performance
    });

  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};


// ======================
// SALESMAN DASHBOARD
// ======================
export const salesmanDashboard = async (req, res) => {
  try {
    const { salesman_id } = req.params;

    const today = todayDate();
    const last7 = getLast7Days();

    const todayLogs = await Log.find({ date: today, user_id: salesman_id });
    const weekLogs = await Log.find({ date: { $in: last7 }, user_id: salesman_id });

    // pending shops
    const pendingShops = await AssignedShop.find({ user_id: salesman_id });

    return res.json({
      status: "success",
      today: todayLogs.length,
      week: weekLogs.length,
      match_today: todayLogs.filter(l => l.result === "match").length,
      mismatch_today: todayLogs.filter(l => l.result === "mismatch").length,
      pending_shops: pendingShops.length
    });

  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};
