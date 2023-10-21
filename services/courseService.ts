import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import cloudinary from "cloudinary";
import { addCourse } from "../features/course.features";
import ApiError from "../utils/ApiError";
import Course from "../models/Course";

// @desc    Add course
// @route   POST /api/v1/course/add-course
// @access  Private/Admin
export const uploadCourse = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = req.body.thumbnail;
      if (thumbnail) {
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });
        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      addCourse(data, res, next);
    } catch (error: any) {
      return next(new ApiError(error.message, 400));
    }
  }
);

// @decs   Edit course
// @route  PUT /api/v1/course/:id
// @access Private/Admin
export const editCourse = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = req.body.thumbnail;
      if (thumbnail) {
        await cloudinary.v2.uploader.destroy(thumbnail.public_id);
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });
        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      const course = await Course.findByIdAndUpdate(
        req.params.id,
        {
          $set: data,
        },
        {
          new: true,
          runValidators: true,
        }
      );
      if (!course) {
        return next(new ApiError("Course not found", 404));
      }
      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ApiError(error.message, 400));
    }
  }
);
