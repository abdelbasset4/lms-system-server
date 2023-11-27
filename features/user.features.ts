import { Response } from "express";
import { redis } from "../config/redis";
import User from "../models/User";

// @desc    Get user by id
export const getUser = async (id: string, res: Response) => {
    const userJson = await redis.get(id);
    if (!userJson) {
        return res.status(404).json({
            success: false,
            message: "user not found",
        });
    }
    const user = JSON.parse(userJson);
    res.status(200).json({
        success: true,
        user,
    });
}

// @desc   Get all users
export const getUsers = async (res: Response) => {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        result:users.length,
        users,
    });
}

// @desc    Update user role
export const updateUserRoleFeature = async (id: string, role: string, res: Response) => {
    const user = await User.findByIdAndUpdate(id, {role}, { new: true });
    res.status(200).json({
        success: true,
        user,
    });
}