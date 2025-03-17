import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { deleteOne } from "../../handlers/factor.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import { couponModel } from "../../../Database/models/coupon.model.js";
import QRCode from "qrcode";

const createCoupon = catchAsyncError(async (req, res, next) => {
  req.body.seller = req.user._id;
  req.body.expires = new Date(req.body.expires);
  const createCoupon = new couponModel(req.body);
  await createCoupon.save();

  res.status(201).json({ message: "success", createCoupon });
});

const getAllCoupons = catchAsyncError(async (req, res, next) => {
  let apiFeature = new ApiFeatures(couponModel.find().populate({path: "seller", select: "name email phone profilePic"}), req.query)
    .pagination()
    .fields()
    .filteration()
    .search()
    .sort();
  const PAGE_NUMBER = apiFeature.queryString.page * 1 || 1;
  const getAllCoupons = await apiFeature.mongooseQuery;

  res
    .status(201)
    .json({ page: PAGE_NUMBER, message: "success", getAllCoupons });
});
const getSellerAllCoupons = catchAsyncError(async (req, res, next) => {
  let apiFeature = new ApiFeatures(couponModel.find({seller: req.user._id}).populate({path: "seller", select: "name email phone profilePic"}), req.query)
    .pagination()
    .fields()
    .filteration()
    .search()
    .sort();
  const PAGE_NUMBER = apiFeature.queryString.page * 1 || 1;
  const getAllCoupons = await apiFeature.mongooseQuery;

  res
    .status(201)
    .json({ page: PAGE_NUMBER, message: "success", getAllCoupons });
});
const getSpecificCoupon = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const getSpecificCoupon = await couponModel.findByIdAndUpdate(id);

  let url = await QRCode.toDataURL(getSpecificCoupon.code);

  getSpecificCoupon &&
    res.status(201).json({ message: "success", getSpecificCoupon, url });

  !getSpecificCoupon && next(new AppError("Coupon was not found", 404));
});

const updateCoupon = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  req.body.expires = new Date(req.body.expires);
  console.log("body: ", req.body)
  const updateCoupon = await couponModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  updateCoupon && res.status(201).json({ message: "success", updateCoupon });

  !updateCoupon && next(new AppError("Coupon was not found", 404));
});

const deleteCoupon = deleteOne(couponModel, "Coupon");
export {
  createCoupon,
  getAllCoupons,
  getSpecificCoupon,
  updateCoupon,
  deleteCoupon,
  getSellerAllCoupons
};
