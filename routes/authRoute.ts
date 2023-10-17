import express from 'express';
import { activateAccount, login, logout, registerNewUser } from '../services/authService';
import { registerUser } from '../utils/validator/authValidator';

const userRoute = express.Router()

userRoute.post('/register',registerUser,registerNewUser)
userRoute.post('/activate-account',activateAccount)
userRoute.post('/login',login)
userRoute.get('/logout',logout)

export default userRoute