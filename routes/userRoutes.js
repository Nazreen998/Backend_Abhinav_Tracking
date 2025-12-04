// routes/userRoutes.js

import express from "express";
import {
  addUser,
  getAllUsers,
  getManagers,
  getSalesmenBySegment,
  editUser,
  deleteUser
} from "../controllers/userController.js";

import { auth } from "../middleware/auth.js";

const router = express.Router();

// MASTER → Add User
router.post("/addUser", auth(["master"]), addUser);

// MASTER → Edit User
router.put("/edit/:id", auth(["master"]), editUser);

// MASTER → Delete User
router.delete("/delete/:id", auth(["master"]), deleteUser);

// ALL USERS (Master & Manager)
router.get("/all", auth(["master", "manager"]), getAllUsers);

// ONLY MANAGERS
router.get("/managers", auth(["master"]), getManagers);

// SALESMEN → segment wise
router.get("/salesmen/:segment", auth(["master", "manager"]), getSalesmenBySegment);

export default router;
