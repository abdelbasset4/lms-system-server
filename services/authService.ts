import ejs from "ejs";
import { NextFunction, Request, Response } from "express";
import path from "path";
import asyncHandler from "express-async-handler";
import jwt, { Secret } from "jsonwebtoken";
import sendEmail from "../utils/sendMail";
import User from "../models/User";
import ApiError from "../utils/ApiError";
require("dotenv").config()

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

      const { activateCode ,token } = activationToken;
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
            message:`Please check your email ${user.email} to activate your account`,
            token: token
        })
      } catch (error: any) {
        return next(new ApiError(`There was a problem to send email`, 500));
      }
    } catch (error: any) {}
  }
);

interface IActivateToken {
    token: string;
    activateCode: string; 
}

export const createActivationToken = (user: any):IActivateToken =>{
    const activateCode =  Math.floor(100000 + Math.random() * 900000).toString();

    const token = jwt.sign({user, activateCode},process.env.JWT_TOKEN as Secret ,{expiresIn:"5m"})

    return {activateCode,token}
}