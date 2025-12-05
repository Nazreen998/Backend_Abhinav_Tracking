// controllers/visitController.js

import Shop from "../models/Shop.js";
import AssignedShop from "../models/AssignedShop.js";
import Log from "../models/Log.js";
import User from "../models/User.js";
import { haversine } from "../utils/distance.js";
import { notifyVisitCompleted } from "../utils/notifications.js";

export const visitShop = async (req, res) => {
  try {
    const { salesman_id, shop_id, lat, lng, photo_url } = req.body;

    if (!salesman_id || !shop_id || !lat || !lng) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields"
      });
    }

    // Salesman
    const salesman = await User.findOne({ user_id: salesman_id });
    if (!salesman) {
      return res.status(404).json({ status: "error", message: "Salesman not found" });
    }

    // Shop
    const shop = await Shop.findOne({ shop_id });
    if (!shop) {
      return res.status(404).json({ status: "error", message: "Shop not found" });
    }

    // Distance calculation
    const distance = haversine(lat, lng, shop.lat, shop.lng);

    let result = distance <= 30 ? "match" : "mismatch";

    // Save log
    const now = new Date();
    await Log.create({
  user_id: salesman_id,
  shop_id,
  shop_name: shop.shop_name,
  salesman: salesman.name,
  date: now.toLocaleDateString("en-GB"),
  time: now.toLocaleTimeString("en-GB"),
  lat,
  lng,
  distance,
  result,
  segment: salesman.segment,

  // added
  photo_url: photo_url || "",
  photo_lat: lat,
  photo_lng: lng
});

    // Remove completed shop from assignments
    await AssignedShop.deleteOne({ user_id: salesman_id, shop_id });

    // Generate notification
    const notification = notifyVisitCompleted(salesman, shop, result, distance);

    // Find next shop
    const nextAssignment = await AssignedShop.findOne({ user_id: salesman_id }).sort({ sequence: 1 });

    if (!nextAssignment) {
      return res.json({
        status: "completed",
        match_status: result,
        distance: distance.toFixed(2),
        message: "Shop visit saved. All shops completed.",
        next_shop: null,
        notification
      });
    }

    const nextShop = await Shop.findOne({ shop_id: nextAssignment.shop_id });

    return res.json({
      status: "completed",
      match_status: result,
      distance: distance.toFixed(2),
      message: "Shop visit logged successfully",
      next_shop: {
        shop_id: nextShop.shop_id,
        shop_name: nextShop.shop_name,
        lat: nextShop.lat,
        lng: nextShop.lng,
        sequence: nextAssignment.sequence
      },
      notification
    });

  } catch (err) {
    console.log("VISIT ERROR:", err);
    return res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};
