// controllers/authController.js

import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const loginUser = async (req, res) => {
  try {
    console.log("🔥 LOGIN REQUEST RECEIVED");

    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({
        status: "error",
        message: "Missing fields",
      });
    }

    // FIND USER BY MOBILE
    const user = await User.findOne({
      mobile: { $regex: "^" + mobile.trim() + "$", $options: "i" }
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Invalid login",
      });
    }

    if (user.password.trim() !== password.trim()) {
      return res.status(404).json({
        status: "error",
        message: "Invalid login",
      });
    }

    // CREATE JWT
    const token = jwt.sign(
      {
        user_id: user.user_id,
        name: user.name,
        mobile: user.mobile,
        role: user.role.toLowerCase(),  // 🔥 VERY IMPORTANT!
        segment: user.segment,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      status: "success",
      user: {
        user_id: user.user_id,
        name: user.name,
        mobile: user.mobile,
        role: user.role.toLowerCase(),
        segment: user.segment,
      },
      token,
    });

  } catch (err) {
    console.log("🔥 SERVER ERROR:", err);
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};
