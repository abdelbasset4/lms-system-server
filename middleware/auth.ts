import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../config/redis";
import { updateAccessToken } from "../services/authService";
export const isAuthenticated = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies.accessToken as string;

    if (!accessToken) {
      return next(new ApiError(`You are not login please login first`, 401));
    }
    const decoded = jwt.decode(
      accessToken
    ) as JwtPayload;

    if (!decoded) {
      return next(new ApiError("token invalid", 401));
    }

    if(decoded.exp && decoded.exp < Date.now()/1000){
      try {
        await updateAccessToken(req,res,next);
      } catch (error) {
        return next(new ApiError("token invalid", 401));
      }
    }else{
    const currentUser = await redis.get(decoded.id);
    if (!currentUser) {
      return next(
        new ApiError(
          "The user that belong to this token does no longer existe",
          401
        )
      );
    }
    if (currentUser) {
      const currentUserObj = JSON.parse(currentUser);
      if (currentUserObj.passwordChangedAt) {
        const passwordChangedTimeStemp = parseInt(
          currentUserObj.passwordChangedAt / 1000 + "",
          10
        );
        if (decoded.iat && passwordChangedTimeStemp > decoded.iat) {
          return next(
            new ApiError(
              "The user that changed password please login again ...",
              401
            )
          );
        }
      }
    }
    req.user = JSON.parse(currentUser);
    next();
  }
    // // check if user change password
  
    //   req.user = currentUserObj;
    // } else {
    //   return next(
    //     new ApiError(
    //       "The user that belong to this token does no longer existe",
    //       401
    //     )
    //   );
    // }
    // next();
  }
);

export const isAllowed = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || "")) {
      return next(
        new ApiError(`You are not allowed to acces this source`, 403)
      );
    }
    next();
  };
};
