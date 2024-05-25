import express from "express";
import { auth } from "../controllers/index";
import authMiddleware from "../middlewares/auth";

const router = express.Router();

router.route("/register").post(auth.register);
router.route("/verify").post(auth.verify);
router.route("/login").post(auth.login);
router.route("/logout").post(authMiddleware, auth.logout);
router.route("/refresh").post(auth.refreshAccessToken);

export default router;
