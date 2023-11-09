import express, { NextFunction, Request, Response } from "express";
import cookiesParser from "cookie-parser";
import cors from "cors";
import dbConntection from "./config/db";
import {globalError} from "./middleware/errorMiddleware";
import path from "path";
import mountRoutes from "./routes";
import {v2 as cloudinary} from "cloudinary";

require('dotenv').config({ path: ".env" });
const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(cookiesParser());
app.use(
  cors({
    origin:["http://localhost:3000"],
    credentials:true
  })
);
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET
})

// Middleware
mountRoutes(app);

app.use("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Invalid URL: ${req.originalUrl}`) as any;
  err.status = 404;
  next(err);
});

//Error handiling middelware note: put this bellow all routes
app.use(globalError);

const server = app.listen(process.env.PORT, () => {
  console.log(`listening on port ${process.env.PORT}`);
  dbConntection();
});
process.on("unhandledRejection", (err: any) => {
  console.error(`unhandledRejection ${err.message} and ${err.name}`);
  server.close(() => {
    console.error(`shut down ......`);
    process.exit(1);
  });
});
