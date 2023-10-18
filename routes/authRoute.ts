import express from 'express';
import { activateAccount, login, logout, registerNewUser } from '../services/authService';
import { registerUser } from '../utils/validator/authValidator';
import { isAllowed, isAuthenticated } from '../middleware/auth';

const userRoute = express.Router()

userRoute.post('/register',registerUser,registerNewUser)
userRoute.post('/activate-account',activateAccount)
userRoute.post('/login',login)
userRoute.get('/logout',isAuthenticated,logout)

export default userRoute