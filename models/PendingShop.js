import mongoose from "mongoose";

const pendingShopSchema = new mongoose.Schema({
  shop_id: String,
  shop_name: String,
  address: String,
  lat: Number,
  lng: Number,

  image: String,               // 🔥 Add this (Base64 image stored here)
  created_by: String,
  created_by_name: String,     // 🔥 Add this so Flutter shows the real name
  created_at: String,

  segment: String
});

export default mongoose.model("PendingShop", pendingShopSchema);
