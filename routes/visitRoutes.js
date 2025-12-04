// routes/visitRoutes.js

import express from "express";
import { visitShop } from "../controllers/visitController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Only Salesman can use this route
router.post("/visitShop", auth(["salesman"]), visitShop);

export default router;
