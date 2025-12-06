import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  user_id: String,
  shop_id: String,
  shop_name: String,
  salesman: String,
  date: String,
  time: String,
  lat: Number,
  lng: Number,
  distance: Number,
  result: String,
  segment: String,

  // NEW FIELDS 🔥
  photo_url: String,
  photo_lat: Number,
  photo_lng: Number,
});

export default mongoose.model("Log", logSchema);
