import AssignedShop from "../models/AssignedShop.js";
import Shop from "../models/Shop.js";
import User from "../models/User.js";
import { haversine } from "../utils/distance.js";
import { notifyShopAssigned } from "../utils/notifications.js";

// -------------------------------------------------------------------
// ASSIGN SHOPS — MASTER / MANAGER ONLY — 100% DUPLICATE SAFE
// -------------------------------------------------------------------
export const assignShops = async (req, res) => {
  try {
    const { salesman_id, shops, salesman_lat, salesman_lng } = req.body;

    if (!salesman_id || !shops || shops.length === 0) {
      return res.status(400).json({ status: "error", message: "Missing fields" });
    }

    // 🔥 1. REMOVE DUPLICATES from frontend list
    const uniqueShopIds = [...new Set(shops)];

    // 🔥 2. Fetch only real shops
    const shopDetails = await Shop.find({ shop_id: { $in: uniqueShopIds } });

    if (shopDetails.length === 0) {
      return res.status(404).json({ status: "error", message: "Invalid shops" });
    }

    // 🔥 3. Add distance
    const sortedList = shopDetails
      .map((shop) => ({
        ...shop._doc,
        distance: haversine(salesman_lat, salesman_lng, shop.lat, shop.lng),
      }))
      .sort((a, b) => a.distance - b.distance);

    // 🔥 4. Clear existing assigned shops
    await AssignedShop.deleteMany({ user_id: salesman_id });

    // 🔥 5. Insert clean sorted assignments
    let seq = 1;
    for (let shop of sortedList) {
      await AssignedShop.create({
        user_id: salesman_id,
        shop_id: shop.shop_id,
        sequence: seq,
        assigned_at: new Date().toLocaleDateString("en-GB"),
      });
      seq++;
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
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// -------------------------------------------------------------------
// GET NEXT SHOP — CLEAN, DISTANCE BASED, SEGMENT FILTERED
// -------------------------------------------------------------------
export const getNextShop = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { lat, lng } = req.query;

    const salesman = await User.findOne({ user_id: userId });
    if (!salesman) return res.json({ shop: null });

    const segment = salesman.segment;

    const assigned = await AssignedShop.find({ user_id: userId });
    if (!assigned.length) return res.json({ shop: null });

    const shopIds = assigned.map((s) => s.shop_id);

    const shops = await Shop.find({
      shop_id: { $in: shopIds },
      segment,
    });

    if (!shops.length) return res.json({ shop: null });

    const sorted = shops
      .map((s) => ({
        ...s._doc,
        distance: haversine(Number(lat), Number(lng), s.lat, s.lng),
      }))
      .sort((a, b) => a.distance - b.distance);

    return res.json({ shop: sorted[0] });
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

    return res.json({ status: "success", message: "Assignment removed" });
  } catch (err) {
    console.log("DELETE ERROR:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};
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

    res.json({ assigned: merged });
  } catch (err) {
    console.log("LIST ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};
