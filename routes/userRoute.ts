import express from 'express';
const userRoute = express.Router()
import { isAllowed, isAuthenticated } from '../middleware/auth';

import { deleteUser, getAllUsers, getLoggedUserData, getUserInfo, updateUserAvatar, updateUserInfo, updateUserPassword, updateUserRole } from '../services/userService';
import { changePasswordValidator, updateUserValidator } from '../utils/validator/userValidator';

userRoute.put('/update-user',isAuthenticated,updateUserValidator,updateUserInfo)
userRoute.put('/update-user-password',isAuthenticated,getLoggedUserData,changePasswordValidator,updateUserPassword)
userRoute.put('/update-user-avatar',isAuthenticated,updateUserAvatar)
userRoute.put('/:id/role',isAuthenticated,isAllowed("admin"),updateUserRole)

userRoute.get('/getMe',isAuthenticated,getUserInfo)
userRoute.get('/get-all',isAuthenticated,isAllowed("admin"),getAllUsers)

userRoute.delete('/delete-user/:id',isAuthenticated,isAllowed("admin"),deleteUser)


export default userRoute