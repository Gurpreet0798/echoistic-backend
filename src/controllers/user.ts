import createHttpError from "http-errors";
import { logger } from "../utils/index";
import { Request, Response, NextFunction } from "express";
import { User } from "../models/index";

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

export default { searchUsers };