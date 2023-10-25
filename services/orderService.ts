import { Request, Response, NextFunction } from "express";
import ejs from "ejs";
import path from "path";
import Order, { IOrder } from "../models/Order";
import Notification from "../models/Notification";
import User from "../models/User";
import Course from "../models/Course";
import  sendEmail  from "../utils/sendMail";
import ApiError from "../utils/ApiError";
import asyncHandeler from "express-async-handler";
import { addOrder } from "../features/order.features";

// @desc    create new order
// @route   POST /api/v1/orders
// @access  private
export const createOrder = asyncHandeler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, payment } = req.body as IOrder;
      const userId = req.user?._id;
      const user = await User.findById(userId);
      if (!user) {
        return next(new ApiError("user not found", 404));
      }

      const courseExiste = user.courses.some(
        (course: any) => course._id.toString() === courseId
      );
      if (courseExiste) {
        return next(new ApiError("you already buy this course", 400));
      }
      const course = await Course.findById(courseId);
      if (!course) {
        return next(new ApiError("course not found", 404));
      }
      const data: any = {
        courseId: course._id,
        userId: req.user?._id,
        payment,
      };

      // send email confirm
      const mailData: any = {
        order: {
          _id: course._id.toString().slice(0, 6),
          title: course.title,
          price: course.price,
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
      };
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/order-confirmation.ejs"),
        { order: mailData }
      );
      try {
        await sendEmail({
          email: user.email,
          subject: "order confirmation",
          template: "order-confirmation.ejs",
          data: mailData,
        });
      } catch (error: any) {
        return next(new ApiError(error.message, 500));
      }
      // save course to user
      user.courses.push({ courseId: course._id });
      await user.save();
      // send notification
      await Notification.create({
        title: "order confirmation",
        message: `you buy ${course.title} course`,
        user: user._id,
      });
    //   update course purchase
        await Course.findByIdAndUpdate(courseId, {
            $inc: { purshased: 1 },
        });

      addOrder(data, res, next);
      res.status(200).json({
        success: true,
        order: course,
      });
    } catch (error: any) {
      return next(new ApiError(error.message, 500));
    }
  }
);
