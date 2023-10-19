import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";

export const updateUserAvatar = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);
