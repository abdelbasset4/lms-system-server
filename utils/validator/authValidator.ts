import { check } from "express-validator";

import validatorMiddleware from "../../middleware/validatorMiddleware";
import User from "../../models/User";

export const registerUser = [
  check("name")
    .notEmpty()
    .withMessage("the Username is required")
    .isLength({ min: 3 })
    .withMessage("the Username is too short"),
  check("email")
    .notEmpty()
    .withMessage("the Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already in user"));
        }
      })
    ),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  validatorMiddleware,
];
