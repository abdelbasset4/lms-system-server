import express from 'express';
const analyticsRoute = express.Router()
import { isAllowed, isAuthenticated } from '../middleware/auth';
import { getUsersAnalytics ,getCoursesAnalytics,getOrdersAnalytics} from '../services/analyticsService';
import { updateAccessToken } from '../services/authService';

analyticsRoute.get('/users',updateAccessToken, isAuthenticated, isAllowed('admin'),getUsersAnalytics)
analyticsRoute.get('/courses',updateAccessToken, isAuthenticated, isAllowed('admin'),getCoursesAnalytics)
analyticsRoute.get('/orders',updateAccessToken, isAuthenticated, isAllowed('admin'),getOrdersAnalytics)

export default analyticsRoute;