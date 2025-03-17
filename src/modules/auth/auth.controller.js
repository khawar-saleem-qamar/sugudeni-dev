import { userModel } from "../../../Database/models/user.model.js";
import { undersignupModel } from "../../../Database/models/undersignup.model.js";
import { undersigninModel } from "../../../Database/models/undersignin.model.js";
import { walletModel } from "../../../Database/models/wallet.model.js";
import { AppError } from "../../utils/AppError.js";

import { catchAsyncError } from "../../utils/catchAsyncError.js";
import {getActiveUserById, getUserById} from "../../handlers/factor.js"

import { OTP } from "../../utils/helperFunctions.js"
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const signUp = catchAsyncError(async (req, res, next) => {
  // console.log(req.body.email);
  const {name, email, phone, password, role} = req.body
  if (email && email.trim() == "" && phone && phone.trim() == "") {
    return next(new AppError("Add atleast one of phone and email", 409));
  }
  let isUserEmailExist = await userModel.findOne({ email });
  if (isUserEmailExist) {
    return next(new AppError("Email Already in use!", 409));
  }
  if(phone){
    let isUserPhoneExist = await userModel.findOne({ phone });
    if (isUserPhoneExist) {
      return next(new AppError("Phone Already in use!", 409));
    }
  }
  const user = new userModel(req.body);
  await user.save();

  // let token = jwt.sign(
  //   { email: user.email, name: user.name, id: user._id, role: user.role },
  //   "JR"
  // );

  if(email){
    var otp = OTP();
    await undersignupModel.create({
      email,
      otp,
      userid: user._id
    })
  }
  if(phone){
    var otp = OTP();
    await undersignupModel.create({
      phone,
      otp,
      userid: user._id
    })
  }

  res.status(201).json({ success: true, message: `verification otp sent to your ${email && phone ? "email and phone" : ""}${email && !phone ? "email" : ""}${!email && phone ? "phone" : ""}` });
});

const verifySignupOtp = catchAsyncError(async (req, res, next) => {
  var { phone, email, otp } = req.body;
  var otpDoc;
  if(phone){
    phone = phone.trim();
  }
  if(email){
    email = email.trim();
  }
  if(phone && phone.trim() != ""){
    otpDoc = await undersignupModel.findOne({ 
      phone
    });
    if(!otpDoc){
      return next(new AppError("Phone number not found", 400));
    }
  }
  if(email && email.trim() != ""){
    email = email.trim();
    otpDoc = await undersignupModel.findOne({ 
      email
    });
    if(!otpDoc){
      return next(new AppError("Email not found", 400));
    }
  }

    if (otpDoc.otp == otp) {
      var user = await userModel.findById(otpDoc.userid);
      if(!user){
        return next(new AppError("User not found", 400));
      }

      await user.updateOne({
        emailVerified: !user.emailVerified && email && email != "" ? true : user.emailVerified ,
        phoneVerified: !user.phoneVerified && phone && phone != "" ? true : user.emailVerified,
        verified: true
      })

      const wallet = await walletModel.create({ userid: user._id });
      await user.updateOne({
        walletid: wallet._id,
      });

       let token = jwt.sign(
        { email: user.email, name: user.name, id: user._id, role: user.role },
        "JR"
      );

      await otpDoc.deleteOne();
      res.status(200).json({
        message: "Sign Up Successfull",
        _id: user._id,
        token: token
      });
    } else {
      return next(new AppError("Otp verification failed", 400));
    }
  }
)

const signIn = catchAsyncError(async (req, res, next) => {
  var { email, password, phone } = req.body;
  var user;
  if(phone){
    phone = phone.trim();
  }
  if(email){
    email = email.trim();
  }
  if(phone && phone.trim() != ""){
    user = await userModel.findOne({ 
      phone
    });
  }
  if(email && email.trim() != ""){
    email = email.trim();
    user = await userModel.findOne({ 
      email
    });
  }
  if(!user){
    return next(new AppError("Invalid email or phone", 401));
  }
  if (email){
    if(!user.emailVerified){
      return next(new AppError("Verify your email", 401));
    }
    if(!bcrypt.compareSync(password, user.password)) {
      return next(new AppError("Invalid email or password", 401));
    } 
    let token = jwt.sign(
      { email: user.email, name: user.name, id: user._id, role: user.role },
      "JR"
    );
    user = await getUserById(user._id)
    res.status(200).json({ success: true, role: user.role, user, token });
  }else if(phone){
    if(!user.phoneVerified){
      return next(new AppError("Verify your phone", 401));
    }
    let undersignin = await undersigninModel.findOne({
      phone
    })
    if(!undersignin){
      undersignin = new undersigninModel({
        phone,
        otp: OTP(),
        userid: user._id
      })
      await undersignin.save();
    }else{
      await undersignin.updateOne({
        otp: OTP()
      })
    }

    res.status(200).json({ success: true, message: "Otp sent to your phone" });
  }else{
    return next(new AppError("Missing email or password", 400));
  }
});

const verifySigninOtp = catchAsyncError(async (req, res, next) => {
  var { phone, otp } = req.body;
  var otpDoc;
  if(phone){
    phone = phone.trim();
  }

  if(phone && phone.trim() != ""){
    otpDoc = await undersigninModel.findOne({ 
      phone
    });
    if(!otpDoc){
      return next(new AppError("Phone number not found", 400));
    }
  }
    if (otpDoc.otp == otp) {
      var user = await userModel.findById(otpDoc.userid);
      if(!user){
        return next(new AppError("User not found", 400));
      }

      let token = jwt.sign(
        { email: user.email, name: user.name, id: user._id, role: user.role },
        "JR"
      );
      user = await getUserById(user._id)
      res.status(200).json({ success: true, role: user.role, user, token });
    } else {
      return next(new AppError("Otp verification failed", 400));
    }
  }
)

const protectedRoutes = catchAsyncError(async (req, res, next) => {
  const { token } = req.headers;
  if (!token) return next(new AppError("Token was not provided!", 401));

  let decoded = await jwt.verify(token, "JR");

  // console.log(decoded);
  // console.log(decoded.iat);

  let user = await userModel.findById(decoded.id);
  if (!user) return next(new AppError("Invalid user", 404));
  // console.log(user);
  // console.log(user.passwordChangedAt);

  if (user.passwordChangedAt) {
    let passwordChangedAt = parseInt(user.passwordChangedAt.getTime() / 1000);
    if (passwordChangedAt > decoded.iat)
      return next(new AppError("Invalid token", 401));
  }
  // console.log(decoded.iat, "-------------->",passwordChangedAt);

  req.user = user;
  next();
});

const allowedTo = (...roles) => {
  return catchAsyncError(async (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError(
          `You are not authorized to access this route. Your are ${req.user.role}`,
          401
        )
      );
    next();
  });
};
export { signUp, signIn, protectedRoutes, allowedTo, verifySigninOtp, verifySignupOtp };
