import jwt, { Secret } from "jsonwebtoken";
import crypto from "crypto";
interface IActivateToken {
    token: string;
    activateCode: string; 
}

export const generateCode = ():string => Math.floor(100000 + Math.random() * 900000).toString();

export const hashedResetCode = (resetCode:string) =>
  crypto.createHash("sha256").update(resetCode).digest("hex");

export const createActivationToken = (user: any):IActivateToken =>{
    const activateCode =  generateCode();

    const token = jwt.sign({user, activateCode},process.env.JWT_TOKEN as Secret ,{expiresIn:"5m"})

    return {activateCode,token}
}