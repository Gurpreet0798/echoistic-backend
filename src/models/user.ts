import mongoose,{  Document , CallbackError } from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import config from "../../config.json"

interface IUser extends Document {
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

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please provide your name"],
    },
    email: {
      type: String,
      required: [true, "please provide your email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "enter valid email address"],
    },
    phoneNumber: {
      type: String,
      minLength: [10, "phone number must be 10"],
      maxLength: [10, "phone number must be 10"],
      required: [true, "please provide your phone number"],
      unique: true,
    },
    pushTokens: {
      type: Array,
    },
    picture: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "hey their! i am using " + config.appName,
    },
    password: {
      type: String,
      required: [true, "please provide your password"],
      minLength: [6, "password must have 6 characters"],
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  try {
    if (this.isNew) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(this.password, salt);
      this.password = hashedPassword;
    }
    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

const User =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
