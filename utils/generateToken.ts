import jwt, { Secret } from "jsonwebtoken";

interface IActivateToken {
    token: string;
    activateCode: string; 
}

export const createActivationToken = (user: any):IActivateToken =>{
    const activateCode =  Math.floor(100000 + Math.random() * 900000).toString();

    const token = jwt.sign({user, activateCode},process.env.JWT_TOKEN as Secret ,{expiresIn:"5m"})

    return {activateCode,token}
}