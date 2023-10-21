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
