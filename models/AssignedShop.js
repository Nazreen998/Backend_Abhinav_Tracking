import mongoose from "mongoose";

const assignedSchema = new mongoose.Schema({
  user_id: String,
  shop_id: String,
  sequence: Number,
  assigned_at: String,  // Old
  date: String          // NEW FIELD (YYYY-MM-DD)
});

export default mongoose.model("AssignedShop", assignedSchema);
