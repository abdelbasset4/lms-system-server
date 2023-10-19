import express from 'express';
const userRoute = express.Router()
import { isAllowed, isAuthenticated } from '../middleware/auth';

import { getLoggedUserData, getUserInfo, updateUserAvatar, updateUserInfo, updateUserPassword } from '../services/userService';
import { changePasswordValidator, updateUserValidator } from '../utils/validator/userValidator';

userRoute.put('/update-user',isAuthenticated,updateUserValidator,updateUserInfo)
userRoute.put('/update-user-password',isAuthenticated,getLoggedUserData,changePasswordValidator,updateUserPassword)
userRoute.put('/update-user-avatar',isAuthenticated,updateUserAvatar)
userRoute.get('/getMe',isAuthenticated,getUserInfo)



export default userRoute