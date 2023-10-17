import express, { NextFunction, Request, Response } from "express";
import cookiesParser from "cookie-parser";
import cors from "cors";
import dbConntection from "./config/db";
import dotenv from "dotenv";
import globalError from "./middleware/errorMiddleware";
import path from "path";
import mountRoutes from "./routes";
import userRoute from "./routes/authRoute";

dotenv.config({ path: ".env" });
const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(cookiesParser());
app.use(
  cors({
    origin: process.env.ORIGIN,
  })
);
// app.use("/api/v1/auth", userRoute);

//Error handiling middelware
app.use(globalError);

// Middleware
mountRoutes(app);

app.use("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Invalid URL: ${req.originalUrl}`) as any;
  err.status = 404;
  next(err);
});
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
