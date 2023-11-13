import express from 'express';
const courseRoute = express.Router()
import { isAllowed, isAuthenticated } from '../middleware/auth';
import { addQuastion, addQuestionReply, addReview, addReviewReply, deleteCourse, editCourse, generateVideoUrl, generateVideoUrlV2, getAllCourses, getAllCoursesAdmin, getSingleCourse, getSingleCourseWithPurchase, uploadCourse } from '../services/courseService';
import { updateAccessToken } from '../services/authService';

courseRoute.post('/add-course',updateAccessToken, isAuthenticated, isAllowed('admin'), uploadCourse)
courseRoute.put('/edit-course/:id',updateAccessToken, isAuthenticated, isAllowed('admin'), editCourse)
courseRoute.get('/get-courses/:id', getSingleCourse)
courseRoute.get('/get-courses', getAllCourses)
courseRoute.get('/get-admin-courses',updateAccessToken,isAuthenticated,isAllowed("admin"), getAllCoursesAdmin)
courseRoute.get('/get-my-courses/:id',updateAccessToken,isAuthenticated, getSingleCourseWithPurchase)

courseRoute.post('/generate-video-url',generateVideoUrl)
courseRoute.get('/generate-video-url-v2/:videoId',generateVideoUrlV2)
courseRoute.delete('/delete-course/:id',updateAccessToken,isAuthenticated,isAllowed("admin"),deleteCourse)


// Quastions 
courseRoute.put("/add-quastion",updateAccessToken,isAuthenticated,addQuastion)
courseRoute.put("/add-reply",updateAccessToken,isAuthenticated,addQuestionReply)

// Reviews 
courseRoute.put("/add-review/:id",updateAccessToken,isAuthenticated,addReview)
courseRoute.put("/add-review-reply",updateAccessToken,isAuthenticated,isAllowed("admin"),addReviewReply)


export default courseRoute;