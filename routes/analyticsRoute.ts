import express from 'express';
const analyticsRoute = express.Router()
import { isAllowed, isAuthenticated } from '../middleware/auth';
import { getUsersAnalytics ,getCoursesAnalytics,getOrdersAnalytics} from '../services/analyticsService';

analyticsRoute.get('/users', isAuthenticated, isAllowed('admin'),getUsersAnalytics)
analyticsRoute.get('/courses', isAuthenticated, isAllowed('admin'),getCoursesAnalytics)
analyticsRoute.get('/orders', isAuthenticated, isAllowed('admin'),getOrdersAnalytics)

export default analyticsRoute;