import express from 'express';
const courseRoute = express.Router()
import { isAllowed, isAuthenticated } from '../middleware/auth';
import { editCourse, getAllCourses, getSingleCourse, uploadCourse } from '../services/courseService';

courseRoute.post('/add-course', isAuthenticated, isAllowed('admin'), uploadCourse)
courseRoute.put('/edit-course/:id', isAuthenticated, isAllowed('admin'), editCourse)
courseRoute.get('/get-courses/:id', getSingleCourse)
courseRoute.get('/get-courses', getAllCourses)

export default courseRoute;