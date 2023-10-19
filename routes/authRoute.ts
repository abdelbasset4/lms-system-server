import express from 'express';
import { activateAccount, login, logout, registerNewUser, updateAccessToken, socialAuth } from '../services/authService';
import { registerUser } from '../utils/validator/authValidator';
import { isAllowed, isAuthenticated } from '../middleware/auth';

const authRoute = express.Router()

authRoute.post('/register',registerUser,registerNewUser)
authRoute.post('/activate-account',activateAccount)
authRoute.post('/login',login)
authRoute.post('/socialauth',socialAuth)
authRoute.get('/logout',isAuthenticated,logout)
authRoute.get('/refreshtoken',updateAccessToken)

export default authRoute