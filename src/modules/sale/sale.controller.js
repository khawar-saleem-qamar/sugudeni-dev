import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { saleModel } from "../../../Database/models/sale.model.js";
import { productModel } from "../../../Database/models/product.model.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";

const createSale = catchAsyncError(async (req, res, next) => {
  req.body.banner = `sale/${req.file.filename}`;
  const sale = new saleModel(req.body);

  await sale.save();

  // console.log(order);
  if (sale) {
    return res.status(201).json({ message: "success", sale });
  } else {
    next(new AppError("Error in creating sale", 404));
  }
});

const updateSale = catchAsyncError(async (req, res, next) => {
  var {id} = req.params
  if(req.file){
    req.body.banner = req.file.filename;
  }

  // console.log(order);
  const updateSale = await saleModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });
  if (updateSale) {
    return res.status(201).json({ message: "success", updateSale });
  } else {
    next(new AppError("Error in creating sale", 404));
  }
});

const getSales = catchAsyncError(async (req, res, next) => {
  let apiFeature = new ApiFeatures(saleModel.find(), req.query)
      .pagination()
      .fields()
      .filteration()
      .search()
      .sort();
  const PAGE_NUMBER = apiFeature.queryString.page * 1 || 1;
  const getAllProducts = await apiFeature.mongooseQuery;

  res
    .status(201)
    .json({ page: PAGE_NUMBER, message: "success", getAllProducts });
});

export {
  createSale,
  updateSale,
  getSales
};
