import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import cloudinary from "cloudinary";
import { addCourse } from "../features/course.features";
import ApiError from "../utils/ApiError";
import Course from "../models/Course";
import { redis } from "../config/redis";

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

// @desc Get Single Course without purchase
// @route GET /api/v1/course/get-courses/:id
// @access Public
export const getSingleCourse = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId= req.params.id;
      const isCashCourse = await redis.get(courseId);
      if(isCashCourse) {
        const course = JSON.parse(isCashCourse)
        res.status(200).json({
          success: true,
          course,
        });
      }else{
        const course = await Course.findById(req.params.id).select("-courseData.questions -courseData.links -courseData.suggestions -courseData.videoUrl");
        if (!course) {
          return next(new ApiError("Course not found", 404));
        }
        await redis.set(courseId, JSON.stringify(course))
        res.status(200).json({
          success: true,
          course,
        });
      }
      
    } catch (error: any) {
      return next(new ApiError(error.message, 400));
    }
  }
);

// @desc Get All Courses without purchase
// @route GET /api/v1/course/get-courses/
// @access Public
export const getAllCourses = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId= req.params.id;
      const isCashCourse = await redis.get("allCourses");
      if(isCashCourse){
        const course = JSON.parse(isCashCourse)
        res.status(200).json({
          success: true,
          course,
        });
      }else{
        const course = await Course.find().select("-courseData.questions -courseData.links -courseData.suggestions -courseData.videoUrl");
        if (!course) {
          return next(new ApiError("Course not found", 404));
        }
        await redis.set("allCourses", JSON.stringify(course))
        res.status(200).json({
          success: true,
          course,
        });
      }
      
    } catch (error: any) {
      return next(new ApiError(error.message, 400));
    }
  }
);

