import express from 'express';
import { activateAccount, login, logout, registerNewUser, updateAccessToken, socialAuth, forgotPassword, verifyResetCode, resetPassword } from '../services/authService';
import { registerUser } from '../utils/validator/authValidator';
import { isAllowed, isAuthenticated } from '../middleware/auth';

const authRoute = express.Router()

authRoute.post('/register',registerUser,registerNewUser)
authRoute.post('/activate-account',activateAccount)
authRoute.post('/login',login)
authRoute.post('/socialauth',socialAuth)

authRoute.post('/forgotpassword',forgotPassword)
authRoute.post('/verifyResetCode',verifyResetCode)
authRoute.put('/resetPassword',resetPassword)

authRoute.get('/logout',isAuthenticated,logout)
authRoute.get('/refreshtoken',updateAccessToken)

export default authRoute