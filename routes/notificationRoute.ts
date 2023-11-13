import express from 'express';
const notificationRoute = express.Router()
import { isAllowed, isAuthenticated } from '../middleware/auth';
import { getNotifications, updateNotification } from '../services/notificationService';
import { updateAccessToken } from '../services/authService';

notificationRoute.get("/get-notifications",updateAccessToken, isAuthenticated, isAllowed('admin'),getNotifications)
notificationRoute.put("/update-status/:id",updateAccessToken, isAuthenticated, isAllowed('admin'),updateNotification)
export default notificationRoute;