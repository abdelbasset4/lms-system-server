import express from 'express';
const notificationRoute = express.Router()
import { isAllowed, isAuthenticated } from '../middleware/auth';
import { getNotifications, updateNotification } from '../services/notificationService';

notificationRoute.get("/get-notifications", isAuthenticated, isAllowed('admin'),getNotifications)
notificationRoute.put("/update-status/:id", isAuthenticated, isAllowed('admin'),updateNotification)
export default notificationRoute;