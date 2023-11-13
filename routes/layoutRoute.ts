import express from 'express';
const layoutRoute = express.Router()
import { isAllowed, isAuthenticated } from '../middleware/auth';
import { createLayout, getLayout, updateLayout } from '../services/layoutService';
import { updateAccessToken } from '../services/authService';

layoutRoute.post('/create',updateAccessToken,isAuthenticated,isAllowed('admin'),createLayout)
layoutRoute.put('/update',updateAccessToken,isAuthenticated,isAllowed('admin'),updateLayout)
layoutRoute.get('/get',getLayout)

export default layoutRoute;