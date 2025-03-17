import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { deleteOne, getUserById } from "../../handlers/factor.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import { userModel } from "../../../Database/models/user.model.js";
import bcrypt from "bcrypt";

const addUser = catchAsyncError(async (req, res, next) => {
  const addUser = new userModel(req.body);
  await addUser.save();

  res.status(201).json({ message: "success", addUser });
});

const getAllUsers = catchAsyncError(async (req, res, next) => {
  let apiFeature = new ApiFeatures(userModel.find(), req.query)
    .pagination()
    .fields()
    .filteration()
    .search()
    .sort();
  const PAGE_NUMBER = apiFeature.queryString.page * 1 || 1;
  const getAllUsers = await apiFeature.mongooseQuery;

  res.status(201).json({ page: PAGE_NUMBER, message: "success", getAllUsers });
});
const getUserDataById = catchAsyncError(async (req, res, next) => {
  var userid = req.params.id
  const userData = await getUserById(userid);

  res.status(201).json({ message: "success", user: userData });
});

const updateUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const updateUser = await userModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  updateUser && res.status(201).json({ message: "success", updateUser });

  !updateUser && next(new AppError("User was not found", 404));
});

const updateDriverInfo = catchAsyncError(async (req, res, next) => {
  // const { userid, firstname, lastname, phone, email, password, licenseNumber, bikeRegistrationNumber, drivingSince, dob } = req.params;  
  // console.log("files:", req.files);
  if(req.files){
    if(req.files.licenseFront)
      req.body.licenseFront = req.files.licenseFront[0].filename;
  
    if(req.files.licenseBack)
      req.body.licenseBack = req.files.licenseBack[0].filename;
  }
  // if(req.file)
  //   req.body.licenseFront = req.file.filename;
  const updateUser = await userModel.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true
  });
  // await updateUser.save();

  updateUser && res.status(201).json({ message: "success", updateUser });

  !updateUser && next(new AppError("User was not found", 404));
});

const updateSellerAccountSetting = catchAsyncError(async (req, res, next) => {
  const updateUser = await userModel.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true
  });
  // await updateUser.save();

  updateUser && res.status(201).json({ message: "success", updateUser });

  !updateUser && next(new AppError("User was not found", 404));
});

const changeUserPassword = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  req.body.passwordChangedAt = Date.now();
  console.log(req.body.passwordChangedAt);
  const changeUserPassword = await userModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  changeUserPassword &&
    res.status(201).json({ message: "success", changeUserPassword });

  !changeUserPassword && next(new AppError("User was not found", 404));
});
const deleteUser = deleteOne(userModel, "user");

export { addUser, getAllUsers, updateUser, deleteUser, changeUserPassword, updateDriverInfo, updateSellerAccountSetting, getUserDataById };
