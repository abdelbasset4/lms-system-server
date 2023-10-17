import { NextFunction, Request, Response } from "express";
import ApiError from "../utils/ApiError";

const JWTInvalidSignatureError =()=> new ApiError('Invalid token please login again...',401)    
const JWTExpired =()=> new ApiError('Token Expired please login again...',401)   
const CastError = (err:any)=> new ApiError(`Resource not found ${err.path}`,400) 
const DuplicateKeyError = (err:any)=> new ApiError(`Duplicate Key  ${Object.keys(err.keyValue)} entered`,400) 
const globalError = (err:any, req:Request, res:Response, next:NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    err.message = err.message || "Internal Server Error";
    if (process.env.NODE_ENV ==='development') {
        developmentError(err,res)
    } else {
        // token error response
        if(err.name ==="JsonWebTokenError") err = JWTInvalidSignatureError();
        // token expiration error response
        if(err.name ==="TokenExpiredError") err = JWTExpired();
        // wrong mongodb id 
        if(err.name ==="CastError") err = CastError(err);
        // duplicate  key error
        if(err.code ===11000) err = DuplicateKeyError(err)

        productionError(err,res)
    }
}

const developmentError = (err:any,res:Response) => res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack:err.stack
})

const productionError = (err:any,res:Response) => res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
})
export default globalError