// routes/dashboardRoutes.js

import express from "express";
import {
  masterDashboard,
  managerDashboard,
  salesmanDashboard
} from "../controllers/dashboardController.js";

import { auth } from "../middleware/auth.js";

const router = express.Router();

// MASTER DASHBOARD
router.get("/master", auth(["master"]), masterDashboard);

// MANAGER DASHBOARD
router.get("/manager/:segment", auth(["manager", "master"]), managerDashboard);

// SALESMAN DASHBOARD
router.get("/salesman/:salesman_id", auth(["salesman", "manager", "master"]), salesmanDashboard);

export default router;
