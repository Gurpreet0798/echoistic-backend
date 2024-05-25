import express from "express";
import { conversation } from "../controllers/index";
import authMiddleware from "../middlewares/auth";

const router = express.Router();

router.route("/").post(authMiddleware, conversation.createConversation);
router.route("/").get(authMiddleware, conversation.getConversations);
router.route("/group").post(authMiddleware, conversation.createGroup);

export default router;
