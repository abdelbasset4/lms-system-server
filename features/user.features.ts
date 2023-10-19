import { Response } from "express";
import { redis } from "../config/redis";

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