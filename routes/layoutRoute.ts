import express from 'express';
const layoutRoute = express.Router()
import { isAllowed, isAuthenticated } from '../middleware/auth';
import { createLayout, getLayout, updateLayout } from '../services/layoutService';

layoutRoute.post('/create',isAuthenticated,isAllowed('admin'),createLayout)
layoutRoute.put('/update',isAuthenticated,isAllowed('admin'),updateLayout)
layoutRoute.get('/get',getLayout)

export default layoutRoute;