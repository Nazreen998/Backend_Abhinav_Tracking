// controllers/pendingShopController.js

import PendingShop from "../models/PendingShop.js";
import Shop from "../models/Shop.js";
import User from "../models/User.js";
import { notifyShopApproved } from "../utils/notifications.js";

/* ---------------------------------------------------------
   GENERATE NEXT SHOP ID (S001, S002, ...)
   → Uses APPROVED shops only (Correct Logic)
--------------------------------------------------------- */
async function generateShopID() {
  const last = await Shop.find().sort({ shop_id: -1 }).limit(1);

  // If no shops exist → start from S001
  if (!last || last.length === 0) return "S001";

  const lastNum = parseInt(last[0].shop_id.replace("S", "")) || 0;
  const next = lastNum + 1;

  return "S" + next.toString().padStart(3, "0");
}

/* ---------------------------------------------------------
   ADD PENDING SHOP
--------------------------------------------------------- */
export const addPendingShop = async (req, res) => {
  try {
    // Required fields check
    const { shop_name, address, lat, lng, image } = req.body;
    if (!shop_name || !address || !lat || !lng || !image) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields"
      });
    }

    // Generate unique shop ID
    const shop_id = await generateShopID();

    // Get salesman info
    const salesman = await User.findOne({ user_id: req.user.user_id });

    const shop = await PendingShop.create({
      shop_id,
      shop_name,
      address,
      lat,
      lng,
      image,
      segment: req.user.segment,
      created_by: req.user.user_id,
      created_by_name: salesman?.name || "Unknown Salesman",
      created_at: new Date().toLocaleString("en-GB"),
    });

    return res.json({
      status: "success",
      message: "Pending shop added",
      shop,
    });

  } catch (err) {
    console.error("Add Pending Shop Error:", err);
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

/* ---------------------------------------------------------
   GET ALL PENDING SHOPS
--------------------------------------------------------- */
export const getPendingShops = async (req, res) => {
  try {
    const pending = await PendingShop.find().sort({ created_at: -1 });

    return res.json({
      status: "success",
      shops: pending,
    });

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

/* ---------------------------------------------------------
   APPROVE SHOP
--------------------------------------------------------- */
export const approvePendingShop = async (req, res) => {
  try {
    const { id } = req.params;

    const shop = await PendingShop.findById(id);
    if (!shop) {
      return res.status(404).json({
        status: "error",
        message: "Pending shop not found",
      });
    }

    // Move to approved shops collection
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

    // Remove pending shop
    await PendingShop.findByIdAndDelete(id);

    return res.json({
      status: "success",
      message: "Shop approved successfully",
      notification,
    });

  } catch (err) {
    console.error("Approve Shop Error:", err);
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

/* ---------------------------------------------------------
   REJECT SHOP
--------------------------------------------------------- */
export const rejectPendingShop = async (req, res) => {
  try {
    const { id } = req.params;

    await PendingShop.findByIdAndDelete(id);

    return res.json({
      status: "success",
      message: "Shop rejected successfully",
    });

  } catch (err) {
    console.error("Reject Shop Error:", err);
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};
