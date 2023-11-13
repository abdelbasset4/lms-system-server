import express from 'express';
const orderRoute = express.Router()
import { isAllowed, isAuthenticated } from '../middleware/auth';
import { createOrder, getAllAdminOrders } from '../services/orderService';
import { updateAccessToken } from '../services/authService';

orderRoute.post('/create-order',updateAccessToken,isAuthenticated,isAllowed("user"),createOrder)
orderRoute.get('/get-all-admin-orders',updateAccessToken,isAuthenticated,isAllowed("admin"),getAllAdminOrders)

export default orderRoute
