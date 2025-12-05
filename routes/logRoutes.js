import express from "express";
import { auth } from "../middleware/auth.js";
import { getAllLogs, filterLogs } from "../controllers/logController.js";

const router = express.Router();

// MASTER → ALL LOGS
router.get("/all", auth(["master"]), getAllLogs);

// UNIVERSAL FILTER → salesman, manager, master
router.post("/filter", auth(["salesman", "manager", "master"]), filterLogs);

export default router;
