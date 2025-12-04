import User from "../models/User.js";

/* =====================================================
     AUTO USER ID GENERATOR (ERROR-PROOF VERSION)
   ===================================================== */

async function generateUserId() {
  // Get last created user
  const lastUser = await User.findOne().sort({ created_at: -1 });

  // If no users exist → start fresh
  if (!lastUser || !lastUser.user_id) {
    return "ABHI001";
  }

  // Extract numeric part
  let numericPart = lastUser.user_id.replace("ABHI", "").trim();

  // Convert to number safely
  let lastNumber = parseInt(numericPart);

  // If conversion fails → reset sequence
  if (isNaN(lastNumber)) lastNumber = 0;

  const nextNumber = lastNumber + 1;

  // Return padded ID
  return "ABHI" + nextNumber.toString().padStart(3, "0");
}

/* =====================================================
     ADD USER  (MASTER ONLY)
   ===================================================== */

export const addUser = async (req, res) => {
  try {
    const { name, mobile, role, password, segment } = req.body;

    if (!name || !mobile || !role || !password) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields",
      });
    }

    // Check existing mobile
    const exist = await User.findOne({ mobile });
    if (exist) {
      return res.status(400).json({
        status: "error",
        message: "Mobile number already exists",
      });
    }

    // Generate ID
    const userId = await generateUserId();

    const user = new User({
      user_id: userId,
      name,
      mobile,
      role,
      password,
      segment,
      created_at: new Date(),
    });

    await user.save();

    return res.json({
      status: "success",
      message: "User created successfully",
      user_id: userId,
    });

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

/* =====================================================
     GET ALL USERS
   ===================================================== */

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.json({ status: "success", users });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

/* =====================================================
     GET MANAGERS ONLY
   ===================================================== */

export const getManagers = async (req, res) => {
  try {
    const managers = await User.find({ role: "manager" });
    return res.json({ status: "success", managers });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

/* =====================================================
     GET SALESMEN BY SEGMENT
   ===================================================== */

export const getSalesmenBySegment = async (req, res) => {
  try {
    const { segment } = req.params;
    const salesmen = await User.find({ role: "salesman", segment });
    return res.json({ status: "success", salesmen });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

/* =====================================================
     EDIT USER
   ===================================================== */

export const editUser = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    return res.json({
      status: "success",
      message: "User updated",
      user: updated,
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

/* =====================================================
     DELETE USER
   ===================================================== */

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await User.findByIdAndDelete(id);

    return res.json({
      status: "success",
      message: "User deleted",
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};
