import express from 'express';
const orderRoute = express.Router()
import { isAllowed, isAuthenticated } from '../middleware/auth';
import { createOrder, getAllAdminOrders } from '../services/orderService';

orderRoute.post('/create-order',isAuthenticated,isAllowed("user"),createOrder)
orderRoute.get('/get-all-admin-orders',isAuthenticated,isAllowed("admin"),getAllAdminOrders)

export default orderRoute
