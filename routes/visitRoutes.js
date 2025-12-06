// routes/visitRoutes.js

import express from "express";
import { auth } from "../middleware/auth.js";
import { visitShop, uploadPhoto } from "../controllers/visitController.js";

const router = express.Router();

// Only Salesman
router.post("/visitShop", auth(["salesman"]), visitShop);

// Upload Photo
router.post("/uploadPhoto", auth(["salesman"]), uploadPhoto);

export default router;
