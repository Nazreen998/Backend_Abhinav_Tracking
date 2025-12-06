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
      return res.status(400).json({
        status: "error",
        message: "Missing fields"
      });
    }

    const salesman = await User.findOne({ user_id: salesman_id });
    const shop = await Shop.findOne({ shop_id });

    if (!salesman || !shop) {
      return res.status(404).json({
        status: "error",
        message: "Invalid shop or user"
      });
    }

    const distance = haversine(lat, lng, shop.lat, shop.lng);
    const result = distance <= 30 ? "match" : "mismatch";

    const now = new Date();

    // Save log
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

    // MATCH → Remove shop
    if (result === "match") {
      await AssignedShop.deleteOne({ user_id: salesman_id, shop_id });
    }

    // ALWAYS RETURN UPDATED SHOP LIST
    const assigned = await AssignedShop.find({ user_id: salesman_id }).sort({
      sequence: 1
    });

    const shops = [];
    for (const a of assigned) {
      const sh = await Shop.findOne({ shop_id: a.shop_id });
      if (sh) {
        shops.push({
          shop_id: sh.shop_id,
          shop_name: sh.shop_name,
          address: sh.address,
          lat: sh.lat,
          lng: sh.lng,
          sequence: a.sequence,
        });
      }
    }

    return res.json({
      status: result,
      distance: distance.toFixed(2),
      shops
    });

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};
