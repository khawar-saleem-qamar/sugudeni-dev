import express from "express";
import * as User from "./user.controller.js";
import { validate } from "../../middlewares/validate.js";
import {
  addUserValidation,
  changeUserPasswordValidation,
  deleteUserValidation,
  updateUserValidation,
  updateDriverValidation,
  updateSellerAccountSettingValidation
} from "./user.validation.js";
import { uploadMultipleFiles } from "../../../multer/multer.js";
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js";

const userRouter = express.Router();

let updateDriverFields = [
  { name: "licenseFront", maxCount: 1 },
  { name: "licenseBack", maxCount: 1 },
];
userRouter
  .route("/updateDriver")
  .patch(
    protectedRoutes,
    allowedTo("driver"),
    uploadMultipleFiles(updateDriverFields, "licenses"),
    validate(updateDriverValidation),
    User.updateDriverInfo
  )
userRouter
.route("/updateSellerSettings")
.patch(
  protectedRoutes,
  allowedTo("seller"),
  validate(updateSellerAccountSettingValidation),
  User.updateSellerAccountSetting
)
  
userRouter
  .route("/")
  .post(validate(addUserValidation), User.addUser)
  .get(User.getAllUsers);

userRouter
.route("/:id")
  .get(User.getUserDataById)
  .put(validate(updateUserValidation), User.updateUser)
  .delete(validate(deleteUserValidation), User.deleteUser)
  .patch(validate(changeUserPasswordValidation), User.changeUserPassword);


export default userRouter;
