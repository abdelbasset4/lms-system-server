import asyncHandler from "express-async-handler";
import { Request, Response,NextFunction } from "express";
import Notification from "../models/Notification";
import ApiError from "../utils/ApiError";
import cron from "node-cron";

// @desc    Get all notifications
// @route   GET /api/v1/notifications
// @access  Private/Admin
export const getNotifications = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const notifications = await Notification.find({}).sort({ createdAt: -1 });
    res.status(201).json({
        success: true,
        notifications,
    
    });
});

// @desc   update notification to read
// @route   PUT /api/v1/notifications/update-status/:id
// @access  Private/Admin
export const updateNotification = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
        return next(new ApiError("Notification not found", 404));
    }
    notification.read = true;
    await notification.save();
    const notifications = await Notification.find({}).sort({ createdAt: -1 });
    res.status(201).json({
        success: true,
        notifications,
    });
});

// @desc   delete notification after 1 month
// @route   Automatically delete notification after 1 month
// @access  Private/Admin
cron.schedule("0 0 0 * * *", async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await Notification.deleteMany({status:true ,createdAt: { $lte: thirtyDaysAgo } });
    console.log("Notification deleted");
    
});