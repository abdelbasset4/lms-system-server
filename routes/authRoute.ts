import express from 'express';
import { registerNewUser } from '../services/authService';

const userRoute = express.Router()

userRoute.post('/register',registerNewUser)

export default userRoute