import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "../interfaces/index";

export default (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"];
  if (!token) {
    return next(createHttpError.Unauthorized());
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "", (error, payload) => {
    if (error) {
      return next(createHttpError.Unauthorized());
    }
    req.user = payload as JwtPayload;
    next();
  });
};
