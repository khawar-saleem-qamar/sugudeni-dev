import slugify from "slugify";
import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { deleteOne } from "../../handlers/factor.js";
import { productModel } from "./../../../Database/models/product.model.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";

function isValue(value){
  if(typeof value == "number"){
    if(!value || value == 0){
      return false
    }else{
      return true
    }
  }else if(typeof value == "string"){
    if(!value || value.trim() == ""){
      return false
    }else{
      return true
    }
  }else if(!value || value == null){
    return false
  }
}

function isValueCompare(product, field, value){
  var hasValue = true;
  console.log("p", product[field].toString())
  if(isValue(product[field].toString())){
    return true;
  }
  if(!isValue(value)){
    hasValue = false
  }
  return hasValue
}

function isAllValues(array){
  var isValueData = true;
  array.map(value => {
    if(!isValueData){
      return;
    }
    isValueData = isValue(value);
  })
  return isValueData;
}

function isAllValuesCompare(product, array){
  var isValueData = true;
  array.map(value => {
    if(!isValueData){
      return;
    }
    isValueData = isValueCompare(product, value[0], value[1]);
  })
  return isValueData;
}

const addProduct = catchAsyncError(async (req, res, next) => {
  // console.log(req.files);
  req.body.imgCover = req.files.imgCover[0].filename;
  req.body.images = req.files.images.map((ele) => ele.filename);

  // console.log(req.body.imgCover, req.body.images);
  if(req.body.title){
    req.body.slug = slugify(req.body.title);
  }
  if(!isAllValues([req.body.title, req.body.weight, req.body.color, req.body.size, req.body.descripton, req.body.price, req.body.quantity, req.body.category, req.body.subcategory])){
    req.body["status"] = "draft";
  }else if(!isValue(req.body.status)){
    req.body["status"] = "active";
  }
  const addProduct = new productModel(req.body);
  await addProduct.save();

  res.status(201).json({ message: "success", addProduct });
});

const getAllProducts = catchAsyncError(async (req, res, next) => {
  let apiFeature = new ApiFeatures(productModel.find(), req.query)
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

const getPopularProducts = catchAsyncError(async (req, res, next) => {
  let apiFeature = new ApiFeatures(productModel.find(), req.query)
    .pagination()
    .sort({sold: -1});
  const PAGE_NUMBER = apiFeature.queryString.page * 1 || 1;
  const getAllProducts = await apiFeature.mongooseQuery;

  res
    .status(201)
    .json({ page: PAGE_NUMBER, message: "success", getAllProducts });
});
const getHotProducts = catchAsyncError(async (req, res, next) => {
  let apiFeature = new ApiFeatures(productModel.find(), req.query)
    .pagination()
    .sort({saleDiscount: -1});
  const PAGE_NUMBER = apiFeature.queryString.page * 1 || 1;
  const getAllProducts = await apiFeature.mongooseQuery;

  res
    .status(201)
    .json({ page: PAGE_NUMBER, message: "success", getAllProducts });
});

const markFetauredProducts = catchAsyncError(async (req, res, next) => {
  var {id, status} = req.body
  var product = await productModel.findById(id)
  if(product){
    await product.updateOne({
      featured: status
    })
    res
      .status(201)
      .json({ message: "success", product });
    }else{
      next(new AppError("Product was not found", 404));
    }
})


const getFetauredProducts = catchAsyncError(async (req, res, next) => {
  let apiFeature = new ApiFeatures(productModel.find({featured: true}), req.query)
    .pagination()
    .sort();
  const PAGE_NUMBER = apiFeature.queryString.page * 1 || 1;
  const getAllProducts = await apiFeature.mongooseQuery;

  res
    .status(201)
    .json({ page: PAGE_NUMBER, message: "success", getAllProducts });
});

const getSpecificProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const getSpecificProduct = await productModel.findByIdAndUpdate(id);
  res.status(201).json({ message: "success", getSpecificProduct });
});

const updateProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  if (req.body.title) {
    req.body.slug = slugify(req.body.title);
  }

  if(req.files && req.files.imgCover && req.files.imgCover.length > 0){
    req.body.imgCover = req.files.imgCover[0].filename;
  }
  if(req.files && req.files.images && req.files.images.length > 0){
    req.body.images = req.files.images.map((ele) => ele.filename);
  }
  var product = await productModel.findById(id);
  if(!product){
    next(new AppError("Product was not found", 404))
  }
  if(!isAllValuesCompare(product, [["title", req.body.title], ["weight", req.body.weight], ["color", req.body.color], ["size", req.body.size], ["descripton", req.body.descripton], ["price", req.body.price], ["quantity", req.body.quantity], ["category", req.body.category], ["subcategory", req.body.subcategory]])){
    req.body["status"] = "draft";
  }else if(!isValue(req.body.status)){
    req.body["status"] = "active";
  }
  console.log("data: ", req.body)
  const updateProduct = await productModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  updateProduct && res.status(201).json({ message: "success", updateProduct });

  !updateProduct && next(new AppError("Product was not found", 404));
});

const updateProductSale = catchAsyncError(async (req, res, next) => {
  var { id } = req.params;
  var {discount} = req.body
  var product = await productModel.findById(id);
  console.log("prodocut", product.price)
  console.log("type", discount)
  var priceAfterDiscount  = product.price - ((discount / 100) * product.price)
  console.log("priceAfterDiscount", priceAfterDiscount)
  var update = {
    priceAfterDiscount,
    saleDiscount: discount
  }
  const updateProduct = await productModel.findByIdAndUpdate(id, update, {
    new: true,
  });

  updateProduct && res.status(201).json({ message: "success", updateProduct });

  !updateProduct && next(new AppError("Product was not found", 404));
});

const deleteProduct = deleteOne(productModel, "Product");

const updateProductStatus = catchAsyncError(async (req, res, next) => {
  const { productid, status } = req.body;
  const updateProduct = await productModel.findByIdAndUpdate(productid, {
    status
  }, {
    new: true,
  });

  updateProduct && res.status(201).json({ message: "success", updateProduct });

  !updateProduct && next(new AppError("Product was not found", 404));
});

const getSellerProducts = catchAsyncError(async (req, res, next) => {
  var {id} = req.params;
  let apiFeature = new ApiFeatures(productModel.find({sellerid: id}), req.query)
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
  addProduct,
  getAllProducts,
  getSpecificProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  getSellerProducts,
  getPopularProducts,
  markFetauredProducts,
  getFetauredProducts,
  updateProductSale,
  getHotProducts
};
