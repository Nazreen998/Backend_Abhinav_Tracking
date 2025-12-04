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

// MASTER + MANAGER → View all shops
router.get("/all", auth(["master", "manager"]), getAllShops);

// MASTER + MANAGER → View shops by segment (pipes / fmcg)
router.get("/segment/:segment", auth(["master", "manager"]), getShopsBySegment);

// MASTER + MANAGER → Edit shop details
router.put("/edit/:id", auth(["master", "manager"]), editShop);

// MASTER + MANAGER → Delete shop
router.delete("/delete/:id", auth(["master", "manager"]), deleteShop);

export default router;
