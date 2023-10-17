import express from 'express';
import { activateAccount, registerNewUser } from '../services/authService';
import { registerUser } from '../utils/validator/authValidator';

const userRoute = express.Router()

userRoute.post('/register',registerUser,registerNewUser)
userRoute.post('/activate-account',activateAccount)

export default userRoute