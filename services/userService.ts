import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import cloudinary from "cloudinary";
import User from "../models/User";
import ApiError from "../utils/ApiError";
import { redis } from "../config/redis";
import { getUser, getUsers, updateUserRoleFeature } from "../features/user.features";
import { sendToken } from "../utils/jwt";

// @desc    put user id in params
// @access  Private
export const getLoggedUserData = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    req.params.id = req.user?._id;
    next();
  }
);

// @desc    get logged user data
// @route   GET /api/v1/users/getMe
// @access  Private
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

// @desc    Get all users
// @route   GET /api/v1/users/get-all
// @access  Private/Admin
export const getAllUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getUsers(res)
    } catch (error: any) {
      return next(new ApiError(error.message, 400));
    }
  }
);

// @desc    Update user profile
// @route   PUT /api/v1/users/update-user
// @access  Private
interface IUSerUpdateInfo {
  name?: string;
}
export const updateUserInfo = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {name} = req.body as IUSerUpdateInfo;
      const userId = req.user?._id as string;
      const user = await User.findById(userId);
      if (!user) {
        return next(new ApiError("user not found", 404));
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

// @desc    Update user password
// @route   PUT /api/v1/users/update-user-password
// @access  Private
interface IUpdatePassword {
  currentpassword: string;
  confirmpassword: string;
  password: string;
}

export const updateUserPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id as string;
    const user = await User.findByIdAndUpdate(userId,{
      password : await bcrypt.hash(req.body.password,12),
      passwordChangedAt:Date.now()
    }, { new: true });
    if (!user) {
      return next(new ApiError("user not found", 404));
    }
    sendToken(user, 200, res);
    await redis.set(userId, JSON.stringify(user));
  }
);

// @desc    Update user avatar
// @route   PUT /api/v1/users/update-user-avatar
// @access  Private

export const updateUserAvatar = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { avatar } = req.body ;
      
      const userId = req.user?._id as string;
      
      const user = await User.findById(userId);
      if (!user) {
        return next(new ApiError("user not found", 404));
      }
      if (avatar) {
        if (user?.avatar?.public_id) {
          console.log("this is old avatar");
                    
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
            console.log("this is new avatar");
            
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

      await user.save();

      // sendToken(user, 200, res);
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

// @desc    Update user role
// @route   PUT /api/v1/user/update-role
// @access  Private/Admin
export const updateUserRole = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { role,email } = req.body;
      const user = await User.findOne({email});
      if (!user) {
        return next(new ApiError("user not found", 404));
      }
      const userId = user._id;
      updateUserRoleFeature(userId, role, res)
    } catch (error: any) {
      return next(new ApiError(error.message, 400));
    }
  }
);

// @desc    Delete user
// @route   DELETE /api/v1/users/delete-user/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {id} = req.params;
      const user = await User.findById(id);
      if (!user) {
        return next(new ApiError("user not found", 404));
      }
      await user.deleteOne({id});
      await redis.del(id);
      res.status(200).json({
        success: true,
        message: "user deleted successfully",
      });
    } catch (error: any) {
      return next(new ApiError(error.message, 400));
    }
  }
);