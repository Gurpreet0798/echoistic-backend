import createHttpError from "http-errors";
import { User } from "../models/index";
import { sendVerificationEmail, jwt } from "../utils/index";
import bcrypt from "bcrypt";
import { Response, Request, NextFunction } from "express";
import validator from "validator";
import { JwtPayload } from "../interfaces/index";

interface TempUser {
  name: string,
  email: string,
  password: string,
  phoneNumber: string,
  verificationCode?: string,
  isVerified?: boolean;
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

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, phoneNumber } =
      req.body;

    if (!name || !email || !password || !phoneNumber) {
      throw createHttpError.BadRequest("Please fill all fields.");
    }

    if (!validator.isEmail(email)) {
      throw createHttpError.BadRequest("invalid email address.");
    }

    if (!validator.isLength(password, { min: 6 })) {
      throw createHttpError.BadRequest("password must have 6 characters");
    }

    if (!validator.isLength(phoneNumber, { min: 10, max: 10 })) {
      throw createHttpError.BadRequest("phone number must be 10");
    }

    const checkDb = await User.findOne({ email });
    if (checkDb) {
      throw createHttpError.Conflict("email already exist.");
    }

    const otp = generateOTP();

    tempUsers[email] = {
      name,
      email,
      password,
      phoneNumber,
      verificationCode: otp,
    };

    sendVerificationEmail(email, otp);

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

    if (tempUser.isVerified) {
      throw createHttpError.BadRequest("User already verified");
    }

    const existingUser = await User.findOne({ email, isDeleted: true });
    if (existingUser) {
      await User.findByIdAndUpdate(existingUser._id, { isDeleted: false });
      res.status(200).json({ message: "User successfully registered" });
      return;
    }

    const newUser = new User({
      name: tempUser.name,
      email: tempUser.email,
      password: tempUser.password,
      phoneNumber: tempUser.phoneNumber,
    });

    await newUser.save();

    tempUser.isVerified = true;

    delete tempUsers[email];

    res.status(200).json({ message: "User successfully registered" });
  } catch (error) {
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createHttpError.BadRequest("Please fill all fields.");
    }

    const user = (await User.findOne({ email }).lean()) as IUser;

    if (!user) {
      throw createHttpError.NotFound("user not found");
    }

    let passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      throw createHttpError.NotFound("invalid user or password");
    }

    const accessToken = await jwt.sign(
      { userId: user._id },
      "1d",
      process.env.ACCESS_TOKEN_SECRET || ""
    );

    const refreshToken = await jwt.sign(
      { userId: user._id },
      "30d",
      process.env.REFRESH_TOKEN_SECRET || ""
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/api/v1/auth/refresh",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "loggedin successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        token: accessToken,
        refreshToken: refreshToken,
      },
    });
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

    res.clearCookie("refreshToken", { path: "/api/v1/auth/refresh" });

    res.status(200).json({ message: "logged out" });
  } catch (error) {
    next(error);
  }
};


const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
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

export default { register, verify, login, logout, refreshAccessToken };
