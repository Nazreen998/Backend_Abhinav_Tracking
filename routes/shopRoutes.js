// routes/shopRoutes.js

import express from "express";
import {
  addShop,
  getAllShops,
  getShopsBySegment,
  editShop,
  deleteShop
} from "../controllers/shopController.js";

import { auth } from "../middleware/auth.js";

const router = express.Router();

// MASTER → Add new shop
router.post("/add", auth(["master"]), addShop);

// ⭐ Allow salesman also to read shops
router.get("/all", auth(["master", "manager", "salesman"]), getAllShops);

router.get("/segment/:segment", auth(["master", "manager", "salesman"]), getShopsBySegment);

// MASTER + MANAGER → Edit shop details
router.put("/edit/:id", auth(["master", "manager"]), editShop);

// MASTER + MANAGER → Delete shop
router.delete("/delete/:id", auth(["master", "manager"]), deleteShop);

export default router;
