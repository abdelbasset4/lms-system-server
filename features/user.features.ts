import { Response } from "express";
import User from "../models/User";

export const getUser = async (id: string, res: Response) => {
    const user = await User.findById(id).select("-password");
    
    res.status(200).json({
        success: true,
        user,
    });
}