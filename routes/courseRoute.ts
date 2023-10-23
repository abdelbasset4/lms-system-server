import express from 'express';
const courseRoute = express.Router()
import { isAllowed, isAuthenticated } from '../middleware/auth';
import { addQuastion, addQuestionReply, editCourse, getAllCourses, getSingleCourse, getSingleCourseWithPurchase, uploadCourse } from '../services/courseService';

courseRoute.post('/add-course', isAuthenticated, isAllowed('admin'), uploadCourse)
courseRoute.put('/edit-course/:id', isAuthenticated, isAllowed('admin'), editCourse)
courseRoute.get('/get-courses/:id', getSingleCourse)
courseRoute.get('/get-courses', getAllCourses)
courseRoute.get('/get-my-courses/:id',isAuthenticated, getSingleCourseWithPurchase)

// Quastions 
courseRoute.put("/add-quastion",isAuthenticated,addQuastion)
courseRoute.put("/add-reply",isAuthenticated,addQuestionReply)

export default courseRoute;