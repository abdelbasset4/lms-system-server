import express from 'express';
const userRoute = express.Router()
import { isAllowed, isAuthenticated } from '../middleware/auth';

import { deleteUser, getAllUsers, getLoggedUserData, getUserInfo, updateUserAvatar, updateUserInfo, updateUserPassword, updateUserRole } from '../services/userService';
import { changePasswordValidator } from '../utils/validator/userValidator';
import { updateAccessToken } from '../services/authService';

userRoute.put('/update-user',updateAccessToken,isAuthenticated,updateUserInfo)
userRoute.put('/update-user-password',updateAccessToken,isAuthenticated,getLoggedUserData,changePasswordValidator,updateUserPassword)
userRoute.put('/update-user-avatar',updateAccessToken,isAuthenticated,updateUserAvatar)
userRoute.put('/:id/role',updateAccessToken,isAuthenticated,isAllowed("admin"),updateUserRole)

userRoute.get('/getMe',updateAccessToken,isAuthenticated,getUserInfo)
userRoute.get('/get-all',updateAccessToken,isAuthenticated,isAllowed("admin"),getAllUsers)

userRoute.delete('/delete-user/:id',updateAccessToken,isAuthenticated,isAllowed("admin"),deleteUser)


export default userRoute