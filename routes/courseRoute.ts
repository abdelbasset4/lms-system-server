import express from 'express';
const courseRoute = express.Router()
import { isAllowed, isAuthenticated } from '../middleware/auth';
import { addQuastion, addQuestionReply, addReview, addReviewReply, deleteCourse, editCourse, generateVideoUrl, generateVideoUrlV2, getAllCourses, getAllCoursesAdmin, getSingleCourse, getSingleCourseWithPurchase, getTopCoursesAdmin, uploadCourse } from '../services/courseService';

courseRoute.post('/add-course', isAuthenticated, isAllowed('admin'), uploadCourse)
courseRoute.put('/edit-course/:id', isAuthenticated, isAllowed('admin'), editCourse)
courseRoute.get('/get-courses/:id', getSingleCourse)
courseRoute.get('/get-courses', getAllCourses)
courseRoute.get('/get-admin-courses',isAuthenticated,isAllowed("admin"), getAllCoursesAdmin)
courseRoute.get('/get-top-admin-courses',isAuthenticated,isAllowed("admin"), getTopCoursesAdmin)
courseRoute.get('/get-my-courses/:id',isAuthenticated, getSingleCourseWithPurchase)

courseRoute.post('/generate-video-url',generateVideoUrl)
courseRoute.get('/generate-video-url-v2/:videoId',generateVideoUrlV2)
courseRoute.delete('/delete-course/:id',isAuthenticated,isAllowed("admin"),deleteCourse)


// Quastions 
courseRoute.put("/add-quastion",isAuthenticated,addQuastion)
courseRoute.put("/add-reply",isAuthenticated,addQuestionReply)

// Reviews 
courseRoute.put("/add-review/:id",isAuthenticated,addReview)
courseRoute.put("/add-review-reply",isAuthenticated,isAllowed("admin"),addReviewReply)


export default courseRoute;