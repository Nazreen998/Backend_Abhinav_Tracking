// controllers/visitController.js

import Shop from "../models/Shop.js";
import AssignedShop from "../models/AssignedShop.js";
import Log from "../models/Log.js";
import User from "../models/User.js";
import { haversine } from "../utils/distance.js";
import { notifyVisitCompleted } from "../utils/notifications.js";
import fs from "fs";

// ---------------- PHOTO UPLOAD ----------------
export const uploadPhoto = async (req, res) => {
  try {
    const { image, filename } = req.body;

    if (!image) return res.status(400).json({ message: "No image provided" });

    const buffer = Buffer.from(image, "base64");
    const filePath = `uploads/${filename}`;

    fs.writeFileSync(filePath, buffer);
    const fullUrl = `${process.env.BASE_URL}/${filePath}`;

    res.json({ status: "success", url: fullUrl });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// ---------------- VISIT SAVE ----------------
export const visitShop = async (req, res) => {
  try {
    const { salesman_id, shop_id, lat, lng, photo_url } = req.body;

    if (!salesman_id || !shop_id || !lat || !lng) {
      return res
        .status(400)
        .json({ status: "error", message: "Missing required fields" });
    }

    const salesman = await User.findOne({ user_id: salesman_id });
    const shop = await Shop.findOne({ shop_id });

    if (!salesman || !shop) {
      return res.status(404).json({
        status: "error",
        message: "Invalid shop or salesman",
      });
    }

    const distance = haversine(lat, lng, shop.lat, shop.lng);
    const result = distance <= 30 ? "match" : "mismatch";

    const now = new Date();

    // Save log into DB
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
      photo_url,
      photo_lat: lat,
      photo_lng: lng,
    });

    // Remove shop from assignment
    await AssignedShop.deleteOne({ user_id: salesman_id, shop_id });

    // Next shop finder
    const nextAssignment = await AssignedShop.findOne({
      user_id: salesman_id,
    }).sort({ sequence: 1 });

    if (!nextAssignment) {
      return res.json({
        status: "completed",
        message: "All shops completed",
        next_shop: null,
      });
    }

    const nextShop = await Shop.findOne({
      shop_id: nextAssignment.shop_id,
    });

    res.json({
      status: "completed",
      match_status: result,
      distance: distance.toFixed(2),
      next_shop: {
        shop_id: nextShop.shop_id,
        shop_name: nextShop.shop_name,
        lat: nextShop.lat,
        lng: nextShop.lng,
        sequence: nextAssignment.sequence,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};
