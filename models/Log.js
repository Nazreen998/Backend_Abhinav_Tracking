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
  segment: String
});

export default mongoose.model("Log", logSchema);
