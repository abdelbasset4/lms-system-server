import { Request } from "express";
import { IUser } from "../../models/User";



declare global {
    declare namespace Express {
        /**
         * Represents an HTTP request.
         */
        interface Request {
            user?: IUser;
        }
    }
}
export { }