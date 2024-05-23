import express from "express";
import { auth } from "../controllers/index";

const router = express.Router();

router.route("/register").post(auth.register);
router.route("/verify").get(auth.verify);
router.route("/login").post(auth.login);
router.route("/logout").post(auth.logout);
router.route("/refresh").post(auth.refreshAccessToken);

export default router;
