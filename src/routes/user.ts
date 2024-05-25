import express from "express";
import { user } from "../controllers/index";
import authMiddleware from "../middlewares/auth";

const router = express.Router();

router.route("/").get(authMiddleware, user.searchUsers);

export default router;
