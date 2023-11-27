import Course from "../models/Course";
import { Response } from "express";
import asyncHandler from "express-async-handler";

// @desc    Add course functionality
export const addCourse = asyncHandler(async (data: any, res: Response) => {
  const course = await Course.create(data);
  res.status(201).json({
    success: true,
    course,
  });
});

// @desc   Get all users
export const getCourses = async (res: Response) => {
  const courses = await Course.find({}).sort({ createdAt: -1 });

  res.status(200).json({
      success: true,
      result:courses.length,
      courses,
  });
}

// @desc   Get all users
export const getTopCourses = async (res: Response) => {
  const courses = await Course.find({}).sort({ purshased: -1 }).limit(5);
  res.status(200).json({
      success: true,
      courses,
  });
}