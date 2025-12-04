// routes/logRoutes.js

import express from "express";
import { getAllLogs, filterLogs } from "../controllers/logController.js";

const router = express.Router();

// MASTER → GET ALL LOGS
router.get("/all", getAllLogs);

// FILTER LOGS FOR manager / salesman
router.post("/filter", filterLogs);

export default router;
