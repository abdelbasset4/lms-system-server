import { Response } from "express";
import { redis } from "../config/redis";
import { IUser } from "../models/User";

interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}

const accesTokenExpire = parseInt(
  process.env.ACCESS_TOKEN_EXPIRE || "300",
  10
);
const refreshTokenExpire = parseInt(
  process.env.REFRESH_TOKEN_EXPIRE || "1200",
  10
);

export const accesTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + accesTokenExpire * 60*60* 1000),
  maxAge: accesTokenExpire *60*60* 1000,
  httpOnly: true,
  sameSite: "lax",
};
export const refreshTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + refreshTokenExpire *24*60*60* 1000),
  maxAge: refreshTokenExpire *24*60*60* 1000,
  httpOnly: true,
  sameSite: "lax",
};
export const sendToken = (user: IUser, statusCode: number, res: Response) => {
  const accessToken = user.SignAccessToken();
  const refreshToken = user.SignRefreshToken();

  //   redis
  redis.set(user._id, JSON.stringify(user) as any);

  

  if (process.env.NODE_ENV === "production") {
    accesTokenOptions.secure = true;
  }

  res.cookie("accessToken", accessToken, accesTokenOptions);
  res.cookie("refreshToken", refreshToken, refreshTokenOptions);

  res.status(statusCode).json({ success: true, user, accessToken });
};
