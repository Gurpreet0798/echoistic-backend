import express from "express";
import { message } from "../controllers/index";
import authMiddleware from "../middlewares/auth";

const router = express.Router();

router.route("/").post(authMiddleware, message.sendMessage);
router.route("/:convoId").get(authMiddleware, message.getMessages);

export default router;
