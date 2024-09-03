import express from "express";
import { user } from "../controllers/index";
import authMiddleware from "../middlewares/auth";
import upload from "../middlewares/multer";

const router = express.Router();

router.route("/").get(authMiddleware, user.searchUsers);
router
  .route("/update")
  .post(upload.single("picture"), authMiddleware, user.updateUser);

export default router;
