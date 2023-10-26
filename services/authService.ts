import ejs from "ejs";
import { NextFunction, Request, Response } from "express";
import path from "path";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import sendEmail from "../utils/sendMail";
import User, { IUser } from "../models/User";
import ApiError from "../utils/ApiError";
import {
  createActivationToken,
  generateCode,
  hashedResetCode,
} from "../utils/generateToken";
import {
  accesTokenOptions,
  refreshTokenOptions,
  sendToken,
} from "../utils/jwt";
import { redis } from "../config/redis";


// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
interface IRegisterBody {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}
export const registerNewUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;

      const user: IRegisterBody = { name, email, password };

      const activationToken = createActivationToken(user);

      const { activateCode, token } = activationToken;
      const data = { user: { name: user.name, activateCode } };
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/activation-mail.ejs"),
        data
      );

      try {
        await sendEmail({
          email: user.email,
          subject: "Activate Your Account",
          template: "activation-mail.ejs",
          data,
        });
        res.status(201).json({
          succes: true,
          message: `Please check your email ${user.email} to activate your account`,
          token: token,
        });
      } catch (error: any) {
        return next(
          new ApiError(`There was a problem to send email ${error}`, 500)
        );
      }
    } catch (error: any) {
      return next(new ApiError(`There was a problem ${error}`, 500));
    }
  }
);

// @desc   Activate user account
// @route  POST /api/v1/auth/activate-account
// @access Public
interface IActivateAccount {
  activate_token: string;
  activate_code: string;
}
export const activateAccount = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activate_token, activate_code } = req.body as IActivateAccount;
      const newUser: { user: IUser; activateCode: string } = jwt.verify(
        activate_token,
        process.env.JWT_TOKEN as string
      ) as { user: IUser; activateCode: string };

      if (newUser.activateCode !== activate_code) {
        return next(new ApiError(`The activation code is invalid`, 400));
      }

      const { name, email, password } = newUser.user;

      const user = User.create({ name, email, password });

      res.status(200).json({
        succes: true,
        user,
      });
    } catch (error: any) {
      return next(new ApiError(error.message, 400));
    }
  }
);

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
interface ILogin {
  email: string;
  password: string;
}

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as ILogin;
      const user = await User.findOne({ email }).select("+password");

      if (!user || !(await user.comparePassword(password))) {
        return next(
          new ApiError("there was an error in email or password", 401)
        );
      }

      sendToken(user, 200, res);
    } catch (error: any) {
      return next(new ApiError(error.message, 400));
    }
  }
);

// @desc    Logout user
// @route   GET /api/v1/auth/logout
// @access  Private
export const logout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie("accessToken", "", { maxAge: 1 });
      res.cookie("refreshToken", "", { maxAge: 1 });
      const userId = req.user?._id || "";

      redis.del(userId);
      res.status(200).json({ success: true, message: "Logout successfully" });
    } catch (error: any) {
      return next(new ApiError(error.message, 400));
    }
  }
);

// @desc    Update Access Token for user using refresh token
// @route   GET /api/v1/auth/refreshtoken
// @access  Private
export const updateAccessToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refresh_token = req.cookies.refreshToken as string;

      const decoded = jwt.verify(
        refresh_token,
        process.env.REFRESH_TOKEN as string
      ) as JwtPayload;

      if (!decoded) {
        return next(new ApiError("token invalid", 401));
      }
      const session = await redis.get(decoded.id as string);
      if (!session) {
        return next(new ApiError("please login to acces this website", 401));
      }
      const user = JSON.parse(session);

      const accessToken = jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN as string,
        {
          expiresIn: "5m",
        }
      );
      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN as string,
        {
          expiresIn: "3d",
        }
      );

      req.user = user;
      res.cookie("accessToken", accessToken, accesTokenOptions);
      res.cookie("refreshToken", refreshToken, refreshTokenOptions);
      
      await redis.set(user._id, JSON.stringify(user), "EX", 7 * 24 * 60 * 60); // 7 days
      res.status(200).json({
        success: true,
        accessToken,
      });
    } catch (error: any) {
      return next(new ApiError(error.message, 400));
    }
  }
);

// @desc   Login with author social media accounts like google, facebook, github
// @route  POST /api/v1/auth/socialauth
// @access Public
interface ISocialAuth {
  name: string;
  email: string;
  avatar: string;
}

export const socialAuth = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, avatar } = req.body as ISocialAuth;
      const user = await User.findOne({ email });
      if (!user) {
        const newUser = await User.create({ name, email, avatar });
        sendToken(newUser, 200, res);
      } else {
        sendToken(user, 200, res);
      }
    } catch (error: any) {
      return next(new ApiError(error.message, 400));
    }
  }
);


// @desc   Forgot password
// @route  POST /api/v1/auth/forgot-password
// @access Public
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      
      if (!user) {
        return next(
          new ApiError(`There is no user for this email ${req.body.email}`, 404)
        );
      }
      const resetCode = generateCode();
      const hashedReset = hashedResetCode(resetCode);

      user.passwordResetCode = hashedReset;
      user.passwordResetCodeExpired = new Date(Date.now() + 10 * 60 * 1000);
      user.passwordResetCodeVerify = false;

      await user.save();

      const data = { user: { name: user.name, resetCode } };
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/forgot-password.ejs"),
        data
      );

      try {
        await sendEmail({
          email: user.email,
          subject: "Your Rest Code",
          template: "forgot-password.ejs",
          data,
        });
        res.status(201).json({
          succes: true,
          message: `Please check your email ${user.email} to get reset code`,
        });
      } catch (error: any) {
        user.passwordResetCode = "";
        user.passwordResetCodeExpired = new Date();
        user.passwordResetCodeVerify = false;
        await user.save();
        return next(
          new ApiError(`There was a problem to send email ${error}`, 500)
        );
      }

    } catch (error: any) {
      return next(new ApiError(error.message, 400));
    }
  }
);

// @desc  Verify reset code
// @route POST /api/v1/auth/verifyResetCode
// @access Public
export const verifyResetCode = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resetCodeHashed = hashedResetCode(req.body.resetCode as string);
      const user = await User.findOne({
        passwordResetCode: resetCodeHashed,
        passwordResetCodeExpired: { $gt: Date.now() },
      });
      if (!user) {
        return next(new ApiError(`Reset Code invalid or expired`, 500));
      }
      user.passwordResetCodeVerify = true;
      await user.save();
      res.status(200).json({ status: "reset code success" });
    } catch (error: any) {
      return next(new ApiError(error.message, 400));
      
    }
  }
)

// @desc  Reset password
// @route PUT /api/v1/auth/resetPassword
// @access Public
interface IResetPassword {
  email: string;
  password: string;
  confirmPassword: string;
}
export const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, confirmPassword } = req.body as IResetPassword;
    const user = await User.findOne({ email: email });
    if (!user) {
      return next(new ApiError(`There is no user for this email ${email}`, 404));
    }
    if (password !== confirmPassword) {
      return next(new ApiError(`Password does not match`, 404));
    }
    if (!user.passwordResetCodeVerify) {
      return next(new ApiError(`Please verify your reset code`, 404));
    }
    // Add the passwordResetCodeVerify property to the user object
    user.password = password;
    user.passwordResetCode = "";
    user.passwordResetCodeExpired = new Date();
    user.passwordResetCodeVerify = false;
    await user.save();

    sendToken(user, 200, res);
    res.status(200).json({ status: "reset password success" });
  } 
)