import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";
import asyncHandeler from "express-async-handler";
import cloudinary from "cloudinary";
import Layout from "../models/Layout";
// @desc   Create layout
// @route  POST /api/v1/layout/create
// @access Private
export const createLayout = asyncHandeler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { type } = req.body;
    const typeExiste = await Layout.findOne({ type });
    if (typeExiste) {
      return next(new ApiError(`${type} alredy existe`, 400));
    }
    if (type === "banner") {
      const { title, subtitle, image } = req.body;
      if (!title || !subtitle || !image) {
        return next(new ApiError("title,subtitle and image are required", 400));
      }
      const myCloud = await cloudinary.v2.uploader.upload(image, {
        folder: "layout/banner",
      });
      const banner = {
        image: {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        },
        title,
        subtitle,
      };
      await Layout.create(banner);
    }
    if (type === "FAQ") {
      const { faq } = req.body;
      const faqItem = await Promise.all(
        faq.map(async (item: any) => {
          return { question: item.question, answer: item.answer };
        })
      );
      await Layout.create({ type: "FAQ", faqs: faqItem });
    }
    if (type === "category") {
      const { category } = req.body;
      const categories = await Promise.all(
        category.map(async (item: any) => {
          const { title } = item;
          if (!title) {
            return next(new ApiError("category title is required", 400));
          }
          return { title };
        })
      );
      await Layout.create({ type: "category", categories: categories });
    }
    res.status(200).json({
      success: true,
      data: "layout created",
    });
  }
);

// @desc   Update layout
// @route  PUT /api/v1/layout/update/
// @access Private
export const updateLayout = asyncHandeler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { type } = req.body;
    if (type === "banner") {
        const bannerData :any = await Layout.findOne({ type: "banner" });
        if(bannerData){
          await cloudinary.v2.uploader.destroy(bannerData.image.public_id);
        }
      const { title, subtitle, image } = req.body;
      if (!title || !subtitle || !image) {
        return next(new ApiError("title,subtitle and image are required", 400));
      }

      const myCloud = await cloudinary.v2.uploader.upload(image, {
        folder: "layout/banner",
      });
      const banner = {
        image: {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        },
        title,
        subtitle,
      };
      await Layout.findByIdAndUpdate(bannerData._id,{banner});
    }
    if (type === "FAQ") {
      const { faq } = req.body;
      const faqData = await Layout.findOne({type:"FAQ"})
      const faqItem = await Promise.all(
        faq.map(async (item: any) => {
          return { question: item.question, answer: item.answer };
        })
      );
      await Layout.findByIdAndUpdate(faqData?._id,{ type: "FAQ", faqs: faqItem });
    }
    if (type === "category") {
      const { category } = req.body;
      const categoryData = await Layout.findOne({type:"category"})
      const categories = await Promise.all(
        category.map(async (item: any) => {
          const { title } = item;
          if (!title) {
            return next(new ApiError("category title is required", 400));
          }
          return { title };
        })
      );
      await Layout.findByIdAndUpdate(categoryData?._id,{ type: "category", categories: categories });
    }
    res.status(200).json({
      success: true,
      data: "layout updated successfully",
    });
  }
);

// @desc   Get layout by type
// @route  GET /api/v1/layout/
// @access Public
export const getLayout = asyncHandeler(
  async (req: Request, res: Response, next: NextFunction) => {
    const layout = await Layout.findOne({type:req.body.type})
    res.status(200).json({
      success: true,
      layout
    });
  }
)