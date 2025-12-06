// controllers/assignController.js

import AssignedShop from "../models/AssignedShop.js";
import Shop from "../models/Shop.js";
import User from "../models/User.js";
import { haversine } from "../utils/distance.js";
import { notifyShopAssigned } from "../utils/notifications.js";

// -------------------------------------------------------------------
// ASSIGN SHOPS — MASTER / MANAGER ONLY — DUPLICATE SAFE
// -------------------------------------------------------------------
export const assignShops = async (req, res) => {
  try {
    const { salesman_id, shops, salesman_lat, salesman_lng } = req.body;

    if (!salesman_id || !Array.isArray(shops) || shops.length === 0) {
      return res
        .status(400)
        .json({ status: "error", message: "Missing or invalid fields" });
    }

    // 1️⃣ Remove duplicates from incoming list
    const uniqueShopIds = [...new Set(shops)];

    // 2️⃣ Fetch valid shop records from DB
    const shopDetails = await Shop.find({ shop_id: { $in: uniqueShopIds } });

    if (shopDetails.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "No valid shops found" });
    }

    // 3️⃣ Add distance from salesman
    const sortedList = shopDetails
      .map((shop) => ({
        ...shop._doc,
        distance: haversine(
          Number(salesman_lat),
          Number(salesman_lng),
          shop.lat,
          shop.lng
        ),
      }))
      .sort((a, b) => a.distance - b.distance);

    // 4️⃣ Clear existing assignments for that salesman
    await AssignedShop.deleteMany({ user_id: salesman_id });

    // 5️⃣ Create new assignments in sorted order
    let seq = 1;
    for (const shop of sortedList) {
      await AssignedShop.create({
        user_id: salesman_id,
        shop_id: shop.shop_id,
        sequence: seq,
        assigned_at: new Date().toLocaleDateString("en-GB"),
      });
      seq++;
    }

    // (Optional) Notify salesman – use only if notifyShopAssigned is implemented
    try {
      const salesman = await User.findOne({ user_id: salesman_id });
      if (salesman) {
        // Adjust parameters to your actual implementation
        notifyShopAssigned(salesman, sortedList);
      }
    } catch (e) {
      console.log("NOTIFY ERROR:", e.message);
    }

    return res.json({
      status: "success",
      message: "Shops assigned successfully",
      assigned: sortedList.map((s, i) => ({
        shop_id: s.shop_id,
        shop_name: s.shop_name,
        sequence: i + 1,
        distance: s.distance.toFixed(2),
      })),
    });
  } catch (err) {
    console.error("ASSIGN ERROR:", err);
    return res
      .status(500)
      .json({ status: "error", message: err.message });
  }
};

// -------------------------------------------------------------------
// GET NEXT SHOP — FULL SHOP DETAILS IN CORRECT ORDER
// -------------------------------------------------------------------
export const getNextShop = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { lat, lng } = req.query;

    const salesman = await User.findOne({ user_id: userId });
    if (!salesman) return res.json({ shops: [] });

    const segment = salesman.segment;

    // 1️⃣ Get assigned shops (sequence order)
    const assigned = await AssignedShop.find({ user_id: userId }).sort({
      sequence: 1,
    });
    if (!assigned.length) return res.json({ shops: [] });

    const shopIds = assigned.map((s) => s.shop_id);

    // 2️⃣ Fetch full shop records
    const shopsDB = await Shop.find({ shop_id: { $in: shopIds }, segment });

    if (!shopsDB.length) return res.json({ shops: [] });

    // 3️⃣ Merge assignment + shop details
    const merged = assigned
      .map((a) => {
        const shop = shopsDB.find((s) => s.shop_id === a.shop_id);
        if (!shop) return null;

        return {
          shop_id: shop.shop_id,
          shop_name: shop.shop_name,
          address: shop.address,
          lat: shop.lat,
          lng: shop.lng,
          sequence: a.sequence,
          distance:
            lat && lng
              ? haversine(Number(lat), Number(lng), shop.lat, shop.lng)
              : null,
        };
      })
      .filter(Boolean);

    // 4️⃣ Primary sort by sequence
    const sorted = merged.sort((a, b) => a.sequence - b.sequence);

    return res.json({ shops: sorted });
  } catch (err) {
    console.log("NEXT ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// -------------------------------------------------------------------
// DELETE ASSIGNED SHOP (MASTER/MANAGER)
// -------------------------------------------------------------------
export const deleteAssignedShop = async (req, res) => {
  try {
    const { userId, shopId } = req.params;

    await AssignedShop.deleteOne({ user_id: userId, shop_id: shopId });

    return res.json({
      status: "success",
      message: "Assignment removed",
    });
  } catch (err) {
    console.log("DELETE ERROR:", err);
    res
      .status(500)
      .json({ status: "error", message: err.message });
  }
};

// -------------------------------------------------------------------
// GET ASSIGNED SHOPS LIST FOR A USER
// -------------------------------------------------------------------
export const getAssignedShopsList = async (req, res) => {
  try {
    const userId = req.params.userId;

    const assigned = await AssignedShop.find({ user_id: userId }).sort({
      sequence: 1,
    });

    if (!assigned.length) {
      return res.json({ assigned: [] });
    }

    const shopIds = assigned.map((s) => s.shop_id);
    const shops = await Shop.find({ shop_id: { $in: shopIds } });

    const merged = assigned.map((a) => {
      const sh = shops.find((s) => s.shop_id === a.shop_id);
      return {
        shop_id: a.shop_id,
        shop_name: sh?.shop_name,
        segment: sh?.segment,
        sequence: a.sequence,
        assigned_at: a.assigned_at,
      };
    });

    return res.json({ assigned: merged });
  } catch (err) {
    console.log("LIST ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};
