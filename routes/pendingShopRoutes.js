import express from "express";
import {
  addPendingShop,
  getPendingShops,
  approvePendingShop,
  rejectPendingShop
} from "../controllers/pendingShopController.js";

import { auth } from "../middleware/auth.js";
import PendingShop from "../models/PendingShop.js";

const router = express.Router();

// Salesman → add
router.post("/add", auth(["salesman"]), addPendingShop);

// Master + Manager → view
router.get("/all", auth(["master", "manager"]), getPendingShops);

// Approve
router.post("/approve/:id", auth(["master", "manager"]), approvePendingShop);

// Reject
router.delete("/reject/:id", auth(["master", "manager"]), rejectPendingShop);

export default router;
