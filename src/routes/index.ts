import express from "express";
import authRoutes from "./auth";
import userRoutes from "./user";
import conversationRoutes from "./conversation";
import messageRoutes from "./message";

const router = express.Router();
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/conversation", conversationRoutes);
router.use("/message", messageRoutes);

export default router;