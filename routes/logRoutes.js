import express from "express";
import { auth } from "../middleware/auth.js";
import {
  getAllLogs,
  getUserLogs,
  getSegmentLogs
} from "../controllers/logController.js";

const router = express.Router();

// MASTER → all logs
router.get("/all", auth(["master"]), getAllLogs);

// SALESMAN → own logs
router.get("/user/:userId", auth(["salesman", "manager", "master"]), getUserLogs);

// MANAGER → segment logs
router.get("/segment/:segment", auth(["manager", "master"]), getSegmentLogs);

export default router;
