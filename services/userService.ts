import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import cloudinary from "cloudinary";
import User from "../models/User";
import ApiError from "../utils/ApiError";
import { redis } from "../config/redis";
import { getUser } from "../features/user.features";
import { sendToken } from "../utils/jwt";

export const getLoggedUserData = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    req.params.id = req.user?._id;
    next();
  }
);

export const getUserInfo = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id as string;
      getUser(userId, res);
    } catch (error: any) {
      return next(new ApiError(error.message, 400));
    }
  }
);

interface IUSerUpdateInfo {
  email?: string;
  name?: string;
}
export const updateUserInfo = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, name } = req.body as IUSerUpdateInfo;
      const userId = req.user?._id as string;
      const user = await User.findById(userId);
      if (!user) {
        return next(new ApiError("user not found", 404));
      }

      if (email) {
        user.email = email;
      }
      if (name) {
        user.name = name;
      }

      await user?.save();

      await redis.set(userId, JSON.stringify(user) as any);
      res.status(200).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ApiError(error.message, 404));
    }
  }
);

interface IUpdatePassword {
  currentpassword: string;
  confirmpassword: string;
  password: string;
}

export const updateUserPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { password } = req.body as IUpdatePassword;
      const userId = req.user?._id as string;
      const user = await User.findById(userId);
      if (!user) {
        return next(new ApiError("user not found", 404));
      }

      user.password = await bcrypt.hash(password, 12);
      user.passwordChangedAt = new Date(Date.now());

      await user.save();

      sendToken(user, 200, res);
      await redis.set(userId, JSON.stringify(user));
      res.status(200).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ApiError(error.message, 400));
    }
  }
);

interface IUpdateAvatar {
  avatar: string;
}


export const updateUserAvatar = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { avatar } = req.body as IUpdateAvatar;

      const userId = req.user?._id as string;

      const user = await User.findById(userId);
      if (!user) {
        return next(new ApiError("user not found", 404));
      }
      if (avatar) {
        if (user?.avatar?.public_id) {
          await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);
          const myCloud = await cloudinary.v2.uploader.upload(avatar, {
            folder: "avatars",
            width: 150,
          });
          user.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };
        }else{
            const myCloud = await cloudinary.v2.uploader.upload(avatar, {
                folder: "avatars",
                width: 150,
              });
              user.avatar = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
              };
        }
      }

      await user?.save();

      sendToken(user, 200, res);
      await redis.set(userId, JSON.stringify(user));
      res.status(200).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ApiError(error.message, 400));
    }
  }
);
