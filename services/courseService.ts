import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import cloudinary from "cloudinary";
import { addCourse, getCourses, getTopCourses } from "../features/course.features";
import ApiError from "../utils/ApiError";
import Course from "../models/Course";
import { redis } from "../config/redis";
import mongoose from "mongoose";
import path from "path";
import ejs from "ejs";
import sendEmail from "../utils/sendMail";
import Notification from "../models/Notification";
import axios from "axios";

// @desc    Add course
// @route   POST /api/v1/course/add-course
// @access  Private/Admin
export const uploadCourse = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = req.body.thumbnail;
      if (thumbnail) {
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });
        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      addCourse(data, res, next);
    } catch (error: any) {
      return next(new ApiError(error.message, 400));
    }
  }
);

// @decs   Edit course
// @route  PUT /api/v1/course/:id
// @access Private/Admin
export const editCourse = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = req.body.thumbnail;
      if (thumbnail && !thumbnail.startsWith("https")) {
        await cloudinary.v2.uploader.destroy(thumbnail.public_id);
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });
        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      if(thumbnail && thumbnail.startsWith("https")){
        data.thumbnail = {
          public_id: thumbnail,
          url: thumbnail,
        };
      }
      const course = await Course.findByIdAndUpdate(
        req.params.id,
        {
          $set: data,
        },
        {
          new: true,
          runValidators: true,
        }
      );
      
      if (!course) {
        return next(new ApiError("Course not found", 404));
      }
      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ApiError(error.message, 400));
    }
  }
);

// @desc Get Single Course without purchase
// @route GET /api/v1/course/get-courses/:id
// @access Public
export const getSingleCourse = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;
      const isCashCourse = await redis.get(courseId);
      if (isCashCourse) {
        const course = JSON.parse(isCashCourse);
        res.status(200).json({
          success: true,
          course,
        });
      } else {
        const course = await Course.findById(req.params.id).select(
          "-courseData.questions -courseData.links -courseData.suggestions -courseData.videoUrl"
        );
        if (!course) {
          return next(new ApiError("Course not found", 404));
        }
        await redis.set(
          courseId,
          JSON.stringify(course),
          "EX",
          7 * 24 * 60 * 60
        ); // 7 days
        res.status(200).json({
          success: true,
          course,
        });
      }
    } catch (error: any) {
      return next(new ApiError(error.message, 400));
    }
  }
);

// @desc Get All Courses without purchase
// @route GET /api/v1/course/get-courses/
// @access Public
export const getAllCourses = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isCashCourse = await redis.get("allCourses");
      if (isCashCourse) {
        const course = JSON.parse(isCashCourse);
        res.status(200).json({
          success: true,
          course,
        });
      } else {
        const course = await Course.find().select(
          "-courseData.questions -courseData.links -courseData.suggestions -courseData.videoUrl"
        );
        if (!course) {
          return next(new ApiError("Course not found", 404));
        }
        await redis.set("allCourses", JSON.stringify(course));
        res.status(200).json({
          success: true,
          course,
        });
      }
    } catch (error: any) {
      return next(new ApiError(error.message, 400));
    }
  }
);

// @desc    Get all courses
// @route   GET /api/v1/course/get-admin-courses
// @access  Private/Admin
export const getAllCoursesAdmin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getCourses(res);
    } catch (error: any) {
      return next(new ApiError(error.message, 400));
    }
  }
);

// @desc    Get Top all courses
// @route   GET /api/v1/course/get-top-admin-courses
// @access  Private/Admin
export const getTopCoursesAdmin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getTopCourses(res);
    } catch (error: any) {
      return next(new ApiError(error.message, 400));
    }
  }
);

// @desc Get Single Course with purchase
// @route GET /api/v1/course/get-my-courses/:id
// @access Private
export const getSingleCourseWithPurchase = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;
      const userCourseList = req.user?.courses;

      const isCoursePurchased = userCourseList?.find(
        (course) => course.courseId.toString() === courseId
      );
      if (!isCoursePurchased) {
        return next(
          new ApiError("You are not allowed to access this course", 404)
        );
      }
      const course = await Course.findById(courseId);
      if (!course) {
        return next(new ApiError("Course not found", 404));
      }
      const courseData = course.courseData;
      res.status(200).json({
        success: true,
        courseData,
      });
    } catch (error: any) {
      return next(new ApiError(error.message, 400));
    }
  }
);

//  @desc Add Question to Course Video
//  @route PUT /api/v1/course/add-question
//  @access Private
interface IAddQuestion {
  question: string;
  courseId: string;
  contentId: string;
}
export const addQuastion = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question, courseId, contentId }: IAddQuestion = req.body;
      const course = await Course.findById(courseId);
      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ApiError("Content not found", 404));
      }
      if (!course) {
        return next(new ApiError("Course not found", 404));
      }
      const courseData = course?.courseData?.find((course: any) =>
        course._id.equals(contentId)
      );
      if (!courseData) {
        return next(new ApiError("Content not found", 404));
      }

      // create new question object
      const newQuestion: any = {
        user: req.user,
        question,
        questionReply: [],
      };
      courseData.questions.push(newQuestion);
      await Notification.create({
        title: "New question",
        message: `you have a new question in  ${courseData.title} video`,
        user: req.user?._id,
      });
      await course.save();
      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ApiError(error.message, 400));
    }
  }
);

// @desc Reply to Question
// @route PUT /api/v1/course/add-question-reply
// @access Private
interface IAddQuestionReply {
  reply: string;
  questionId: string;
  courseId: string;
  contentId: string;
}
export const addQuestionReply = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reply, questionId, courseId, contentId }: IAddQuestionReply =
        req.body;
      const course = await Course.findById(courseId);
      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ApiError("Content not found", 404));
      }
      if (!course) {
        return next(new ApiError("Course not found", 404));
      }
      const courseData = course?.courseData?.find((course: any) =>
        course._id.equals(contentId)
      );
      if (!courseData) {
        return next(new ApiError("Content not found", 404));
      }

      const question = courseData?.questions?.find((course: any) =>
        course._id.equals(questionId)
      );
      if (!question) {
        return next(new ApiError("Question not found", 404));
      }

      // create new reply object
      const newReply: any = {
        user: req.user,
        comment: reply,
      };
      question.questionReply.push(newReply);
      await course.save();

      if (req.user?._id === question.user._id) {
        // Send notification to user
        await Notification.create({
          title: "New question reply",
          message: `you have a new question reply in  ${courseData.title} video`,
          user: req.user?._id,
        });
      } else {
        // send email
        const data = {
          name: question.user.name,
          title: courseData.title,
        };

        const html = await ejs.renderFile(
          path.join(__dirname, "../mails/question-reply.ejs"),
          data
        );
        if (question.user.email) {
          try {
            await sendEmail({
              email: question.user.email,
              subject: "Question Reply",
              template: "question-reply.ejs",
              data,
            });
          } catch (error: any) {
            return next(new ApiError(error.message, 400));
          }
        } else {
          return next(new ApiError("No email address defined", 400));
        }
      }
      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ApiError(error.message, 400));
    }
  }
);

// @desc add review to course
// @route PUT /api/v1/course/add-review
// @access Private
interface IAddReview {
  review: string;
  rating: number;
  userId: string;
}
export const addReview = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCourses = req.user?.courses;
      const { review, rating }: IAddReview = req.body;
      const courseId = req.params.id;
      const courseExiste = userCourses?.some(
        (course) => course.courseId.toString() === courseId.toString()
      );
      if (!courseExiste) {
        return next(
          new ApiError("You are not allowed to add review in this course", 404)
        );
      }
      const course = await Course.findById(courseId);
      if (!course) {
        return next(new ApiError("Course not found", 404));
      }
      const newReview: any = {
        user: req.user,
        rating,
        comment: review,
      };
      course.reviews.push(newReview);

      // calc raview average
      let avg = 0;
      course.reviews.forEach((course) => {
        avg += course.rating;
      });
      course.rating = avg / course.reviews.length;

      await course.save();

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ApiError(error.message, 400));
    }
  }
);

// @desc add reply in review
// @route PUT /api/v1/course/add-review-reply
// @access Private(Admin)
interface IReviewReply {
  comment: string;
  courseId: string;
  reviewId: string;
}
export const addReviewReply = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { comment, courseId, reviewId }: IReviewReply = req.body;
      const course = await Course.findById(courseId);
      if (!course) {
        return next(new ApiError("Course not found", 404));
      }
      const review = course?.reviews?.find(
        (review) => review._id.toString() === reviewId
      );
      if (!review) {
        return next(new ApiError("Review not found", 404));
      }

      const reviewReply: any = {
        user: req.user,
        comment,
      };
      review.commentReply.push(reviewReply);
      await course.save();
      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ApiError(error.message, 404));
    }
  }
);

// @desc    Delete course
// @route   DELETE /api/v1/course/delete-course/:id
// @access  Private/Admin
export const deleteCourse = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const course = await Course.findById(id);
      if (!course) {
        return next(new ApiError("course not found", 404));
      }
      await course.deleteOne({ id });
      await redis.del(id);
      res.status(200).json({
        success: true,
        message: "course deleted successfully",
      });
    } catch (error: any) {
      return next(new ApiError(error.message, 400));
    }
  }
);

// @desc    Generate Course Video Url
// @route   POST /api/v1/course/generate-video-url
// @access  Private/Admin
export const generateVideoUrl = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { videoId } = req.body;
      const videoUrl = await axios.post(
        `https://dev.vdocipher.com/api/videos/${videoId}/otp`,
        { ttl: 300 },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Apisecret ${process.env.VDOCIPHER_API_KEY}`,
          },
        }
      );
      res.status(200).json(videoUrl.data);
    } catch (error: any) {
      return next(new ApiError(error.message, 400));
    }
  }
);

export const generateVideoUrlV2 = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { videoId } = req.params;
      const response = await axios.get(
        `https://api.wistia.com/v1/medias/${videoId}.json`,
        {
          headers: {
            accept: "application/json",
            authorization:
              "Bearer cfbd28e5320966c6d1088a912f7d345fdcafabb0769e1babf44984262f21f2a6",
          },
        }
      );
      const videoUrl = response.data.assets[0].url;
      res.status(200).json(videoUrl);
    } catch (error: any) {
      return next(new ApiError(error.message, 400));
    }
  }
);
