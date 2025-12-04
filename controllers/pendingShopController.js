// controllers/pendingShopController.js

import PendingShop from "../models/PendingShop.js";
import Shop from "../models/Shop.js";
import User from "../models/User.js";
import { notifyShopApproved } from "../utils/notifications.js";

async function generateShopID() {
  const last = await PendingShop.find().sort({ _id: -1 }).limit(1);
  if (last.length === 0) return "S001";

  const lastNum = parseInt(last[0].shop_id.replace("S", ""));
  return "S" + (lastNum + 1).toString().padStart(3, "0");
}

export const addPendingShop = async (req, res) => {
  try {
    const id = await generateShopID();

    // GET SALESMAN NAME
    const salesman = await User.findOne({ user_id: req.user.user_id });

    const shop = await PendingShop.create({
      shop_id: id,
      shop_name: req.body.shop_name,
      address: req.body.address,
      lat: req.body.lat,
      lng: req.body.lng,
      image: req.body.image,
      created_by: req.user.user_id,
      created_by_name: salesman?.name || req.user.user_id,
      created_at: new Date().toLocaleString("en-GB"),
      segment: req.user.segment
    });

    return res.json({ status: "success", shop });

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

export const getPendingShops = async (req, res) => {
  try {
    const pending = await PendingShop.find();
    res.json({ status: "success", shops: pending });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const approvePendingShop = async (req, res) => {
  try {
    const { id } = req.params;

    const shop = await PendingShop.findById(id);
    if (!shop)
      return res.status(404).json({ status: "error", message: "Shop not found" });

    await Shop.create({
      shop_id: shop.shop_id,
      shop_name: shop.shop_name,
      address: shop.address,
      lat: shop.lat,
      lng: shop.lng,
      segment: shop.segment,
      created_by: shop.created_by,
      created_at: shop.created_at,
      status: "approved",
    });

    const salesman = await User.findOne({ user_id: shop.created_by });
    const notification = notifyShopApproved(shop, salesman);

    await PendingShop.findByIdAndDelete(id);

    res.json({ status: "success", message: "Shop approved", notification });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const rejectPendingShop = async (req, res) => {
  try {
    await PendingShop.findByIdAndDelete(req.params.id);
    res.json({ status: "success", message: "Shop rejected" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
