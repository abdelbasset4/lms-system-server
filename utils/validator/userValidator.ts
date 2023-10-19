import { body, check } from "express-validator";

import validatorMiddleware from "../../middleware/validatorMiddleware";
import User from "../../models/User";

export const updateUserValidator = [
    check('id')
    .isMongoId().withMessage('incorrect id format'),

    body('email').optional()
    .isEmail().withMessage('Invalid email address')
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error('E-mail already in user'));
        }
      })
    ),
    validatorMiddleware
]

export const changePasswordValidator = [
    check('id')
    .isMongoId().withMessage('incorrect id format'),
    body('currentpassword').notEmpty().withMessage('you must enter current password'),
    body('confirmpassword').notEmpty().withMessage('you must enter confirm password'),
    body('password').notEmpty().withMessage('you must enter new password').custom(async (val,{req})=>{
        // 1- verify current password
        const user = await User.findById(req.params?.id)
        if(!user){
            throw new Error('there is no user for this id')
        }
        const isCorrectPassword = await user.comparePassword(req.body.currentpassword)
        if(!isCorrectPassword){
            throw new Error('the current password is incorrect')
        }
        // 2- verify confirm password
        if(val !== req.body.confirmpassword){
            throw new Error('password confrmation  is incorrect')
        }
        return true
    })
    ,validatorMiddleware]