// routes/assignRoutes.js

import express from "express";
import {
  assignShops,
  getNextShop,
  deleteAssignedShop,
  getAssignedShopsList
} from "../controllers/assignController.js";

import { auth } from "../middleware/auth.js";

const router = express.Router();

// Assign shops (Master/Manager)
router.post("/assignShops", auth(["master", "manager"]), assignShops);

// ⭐ Salesman → GET NEXT SHOP (THIS WAS MISSING)
router.get("/next/:userId", auth(["salesman"]), getNextShop);

// Master/Manager → Get assigned list
router.get("/list/:userId", auth(["master", "manager"]), getAssignedShopsList);

// Delete assigned shop (master/manager)
router.delete(
  "/remove/:userId/:shopId",
  auth(["master", "manager"]),
  deleteAssignedShop
);

export default router;
