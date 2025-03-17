import { AppError } from "../utils/AppError.js";
import { catchAsyncError } from "../utils/catchAsyncError.js";
import { userModel } from "../../Database/models/user.model.js";


export const deleteOne = (model, name) => {
  return catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const document = await model.findByIdAndDelete(id, {
      new: true,
    });

    let response = {};
    response[name] = document;
    console.log(response);
    console.log({ ...response });
    console.log(name);
    document && res.status(201).json({ message: "success", ...response });

    !document && next(new AppError(`${name} was not found`, 404));
  });
};

export const getActiveUserById = async (userid) => {
  var user =  await userModel.findById(userid)
  if(!user){
    return {
      data: null,
      error: "User Not Found"
    }
  }else if(email.trim() == "" && phone.trim() == ""){
    return {
      data: null,
      error: "Please add email or phone to create account"
    }
  }else if(email.trim() != "" && !user.emailVerified){
    return {
      data: null,
      error: "Please verify you email"
    }
  }else if(phone.trim() != "" && !user.phoneVerified){
    return {
      data: null,
      error: "Please verify you phone"
    }
  }else if(user.blocked){
    return {
      data: null,
      error: "User blocked"
    }
  }else if(!user.isActive){
    return {
      data: null,
      error: "User inactive"
    }
  }
  if(user.role != "driver"){
    user = user.toObject();
    delete user.licenseNumber
    delete user.bikeRegistrationNumber
    delete user.licenseFront
    delete user.licenseBack
    delete user.drivingSince
    delete user.dob
  }else if(user.role != "seller"){
    delete user.storeName,
    delete user.bank
  }
  delete user.password;

  return { data: user, error: null};
};

export const getUserById = async (userid) => {
  var user =  await userModel.findById(userid)
  if(!user){
    return {
      data: null,
      error: "User Not Found"
    }
  }
  if(user.role != "driver"){
    user = user.toObject();
    delete user.licenseNumber
    delete user.bikeRegistrationNumber
    delete user.licenseFront
    delete user.licenseBack
    delete user.drivingSince
    delete user.dob
  }else if(user.role != "seller"){
    delete user.storeName,
    delete user.bank
  }
  delete user.password;

  return user;
};
