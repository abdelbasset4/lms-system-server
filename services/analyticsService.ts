import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError";
import User from "../models/User";
import { generateAnalytics } from "../utils/generateAnalytics";
import Course from "../models/Course";
import Order from "../models/Order";

// @decs   Get Users analytics
// @route  GET /api/v1/analytics/users
// @access Private/Admin
export const getUsersAnalytics = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const users = await generateAnalytics(User)
    res.status(200).json({
        success: true,
        users
    });
});

// @decs   Get Course analytics
// @route  GET /api/v1/analytics/courses
// @access Private/Admin
export const getCoursesAnalytics = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const courses = await generateAnalytics(Course)
    res.status(200).json({
        success: true,
        courses
    });
});
// @decs   Get Orders analytics
// @route  GET /api/v1/analytics/orders
// @access Private/Admin
export const getOrdersAnalytics = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const orders = await generateAnalytics(Order)
    res.status(200).json({
        success: true,
        orders
    });
});