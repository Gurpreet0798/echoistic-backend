import createHttpError from "http-errors";
import { logger } from "../utils/index";
import { Request, Response, NextFunction } from "express";
import { User } from "../models/index";
import { cloudinary } from "../utils/index";

const searchUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const keyword = req.query.search;

    if (!keyword) {
      logger.error("Please add a search query first");
      throw createHttpError.BadRequest("Oops...Something went wrong !");
    }

    const users = await User.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
      ],
    }).find({
      _id: { $ne: req.user?.userId },
    });

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    console.log(req.body);

    if (!user) {
      throw createHttpError.NotFound("user not found");
    }

    if (req.file) {
      const filePath = req.file?.path ?? "";

      const result = await cloudinary.uploader.upload(filePath, {
        folder: "user_images", // Optional: organize images in a specific folder
        resource_type: "image", // Ensure it's treated as an image
      });

      if (user.picture) {
        const imageId = user.picture.split("/").slice(-1)[0].split(".")[0];
        await cloudinary.uploader.destroy(imageId);
      }

      user.picture = result.secure_url;
      await user.save();
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      throw createHttpError.NotFound("user not found");
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw createHttpError.NotFound("staff user not found");
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export default { searchUsers, updateUser, deleteUser, getUserById };
