// routes/assignRoutes.js

import express from "express";
import {
  assignShops,
  getNextShop,
  deleteAssignedShop,
  getAssignedShopsList     // 🔥 ADD THIS
} from "../controllers/assignController.js";


import { auth } from "../middleware/auth.js";

const router = express.Router();

// Assign shops (Master/Manager)
router.post("/assignShops", auth(["master", "manager"]), assignShops);

// Salesman next shop
// Get assigned shops list for a salesman
router.get(
  "/list/:userId",
  auth(["master", "manager"]),
  getAssignedShopsList
);


// Delete assigned shop (master/manager)
router.delete(
  "/remove/:userId/:shopId",
  auth(["master", "manager"]),
  deleteAssignedShop
);

export default router;
