import express from 'express';
const orderRoute = express.Router()
import { isAllowed, isAuthenticated } from '../middleware/auth';
import { createOrder } from '../services/orderService';

orderRoute.post('/create-order',isAuthenticated,isAllowed("user"),createOrder)

export default orderRoute
