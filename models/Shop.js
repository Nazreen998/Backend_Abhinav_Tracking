import mongoose from "mongoose";

const shopSchema = new mongoose.Schema({
  shop_id: String,
  shop_name: String,
  address: String,
  lat: Number,
  lng: Number,
  created_by: String,
  created_at: String,
  segment: String,
  status: String
});

export default mongoose.model("Shop", shopSchema);
