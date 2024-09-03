import createHttpError from "http-errors";
import { User } from "../models/index";
import { sendAuthOTP, jwt } from "../utils/index";
import bcrypt from "bcrypt";
import { Response, Request, NextFunction } from "express";
import validator from "validator";
import { JwtPayload } from "../interfaces/index";

interface TempUser {
  email: string;
  verificationCode?: string;
}

interface IUser {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  pushTokens: Array<string>;
  picture: string;
  status: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const tempUsers: Record<string, TempUser> = {};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw createHttpError.BadRequest("Please provide email address.");
    }

    if (!validator.isEmail(email)) {
      throw createHttpError.BadRequest("invalid email address.");
    }

    const otp = generateOTP();

    tempUsers[email] = {
      email,
      verificationCode: otp,
    };

    sendAuthOTP(email, otp);

    return res.status(200).json({
      message: "Verification email sent. Please check your email for the OTP.",
    });
  } catch (error) {
    next(error);
  }
};

const verify = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body;
    const tempUser = tempUsers[email];

    if (!tempUser) {
      throw createHttpError.BadRequest("user not found. register first");
    }

    if (tempUser.verificationCode != otp) {
      throw createHttpError.BadRequest("Invalid OTP");
    }

    const existingUser = await User.findOne({ email });
    let user;
    if (existingUser) {
      if (existingUser.isDeleted) {
        await User.findByIdAndUpdate(existingUser._id, { isDeleted: false });
      }
      user = existingUser;
    } else {
      const newUser = new User({
        email: tempUser.email,
      });
      await newUser.save();
      user = newUser;

      delete tempUsers[email];
    }

    const accessToken = await jwt.sign(
      { userId: user._id },
      "30d",
      process.env.ACCESS_TOKEN_SECRET || ""
    );

    const refreshToken = await jwt.sign(
      { userId: user._id },
      "30d",
      process.env.REFRESH_TOKEN_SECRET || ""
    );

    res.status(200).json({
      message: "loggedin successfully",
      user: {
        _id: user._id,
        email: user.email,
        token: accessToken,
        refreshToken: refreshToken,
      },
    });

    res.status(200).json({ message: "User successfully registered" });
  } catch (error) {
    next(error);
  }
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { pushToken } = req.body;

    if (pushToken) {
      await User.findByIdAndUpdate(userId, {
        $pull: { pushTokens: { $in: [pushToken] } },
      });
    }

    res.status(200).json({ message: "logged out" });
  } catch (error) {
    next(error);
  }
};

const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw createHttpError.Unauthorized("please login");
    }

    const check = (await jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || ""
    )) as JwtPayload;

    const user = await User.findById(check?.userId);
    if (!user) {
      throw createHttpError.BadRequest("refresh token expired, please login");
    }

    const accessToken = await jwt.sign(
      { userId: user._id },
      "1d",
      process.env.ACCESS_TOKEN_SECRET || ""
    );

    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        token: accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default { verify, login, logout, refreshAccessToken };
