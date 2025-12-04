// controllers/shopController.js

import Shop from "../models/Shop.js";


// ADD SHOP (MASTER ONLY)
export const addShop = async (req, res) => {
  try {
    const { shop_id, shop_name, address, lat, lng, created_by, segment } = req.body;

    if (!shop_id || !shop_name || !address || !lat || !lng) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields"
      });
    }

    const exists = await Shop.findOne({ shop_id });
    if (exists) {
      return res.status(400).json({
        status: "error",
        message: "Shop ID already exists"
      });
    }

    const shop = await Shop.create({
      shop_id,
      shop_name,
      address,
      lat,
      lng,
      segment,
      created_by,
      created_at: new Date().toLocaleDateString("en-GB"),
      status: "approved"
    });

    return res.json({
      status: "success",
      message: "Shop added successfully",
      shop
    });

  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};



// GET ALL SHOPS (MASTER + MANAGER)
export const getAllShops = async (req, res) => {
  try {
    const shops = await Shop.find();
    return res.json({
      status: "success",
      shops
    });

  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};



// GET SHOPS BY SEGMENT (pipes / fmcg)
export const getShopsBySegment = async (req, res) => {
  try {
    const { segment } = req.params;

    const shops = await Shop.find({ segment });

    return res.json({
      status: "success",
      shops
    });

  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};



// EDIT SHOP (MASTER + MANAGER)
export const editShop = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Shop.findByIdAndUpdate(id, req.body, { new: true });

    return res.json({
      status: "success",
      message: "Shop updated successfully",
      shop: updated
    });

  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};



// DELETE SHOP (MASTER + MANAGER)
export const deleteShop = async (req, res) => {
  try {
    const { id } = req.params;

    await Shop.findByIdAndDelete(id);

    return res.json({
      status: "success",
      message: "Shop deleted successfully"
    });

  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};
