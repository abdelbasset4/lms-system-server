import express from 'express';
import { activateAccount, login, logout, registerNewUser, updateAccessToken,getUserInfo, socialAuth } from '../services/authService';
import { registerUser } from '../utils/validator/authValidator';
import { isAllowed, isAuthenticated } from '../middleware/auth';

const userRoute = express.Router()

userRoute.post('/register',registerUser,registerNewUser)
userRoute.post('/activate-account',activateAccount)
userRoute.post('/login',login)
userRoute.post('/socialauth',socialAuth)
userRoute.get('/logout',isAuthenticated,logout)
userRoute.get('/refreshtoken',updateAccessToken)
userRoute.get('/getMe',isAuthenticated,getUserInfo)

export default userRoute