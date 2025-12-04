import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  name: { type: String, required: true },
  mobile: {  type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },      // master / manager / salesman
  segment: { type: String, required: true },   // all / fmcg / pipes / salesman-fmcg / salesman-pipes
  created_at: { type: String, default: "" }
});

export default mongoose.model("User", userSchema);
