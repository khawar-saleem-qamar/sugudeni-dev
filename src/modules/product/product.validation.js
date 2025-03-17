import Joi from "joi";

const addProductValidation = Joi.object({
  sellerid: Joi.string().hex().length(24).required(),
  title: Joi.string().trim().min(3),
  imgCover: Joi.string(),
  weight: Joi.string(),
  color: Joi.string(),
  size: Joi.string(),
  images: Joi.array().items(Joi.string()),
  descripton: Joi.string().max(100).min(10).trim(),
  price: Joi.number().min(0).default(0),
  priceAfterDiscount: Joi.number().min(0).default(0),
  quantity: Joi.number().min(0).default(0),
  sold: Joi.number().min(0).default(0),
  category: Joi.string().hex().length(24),
  subcategory: Joi.string().hex().length(24),
  status: Joi.string(),
  ratingAvg: Joi.number().min(1).max(5),
  ratingCount: Joi.number().min(0),
});

const getSpecificProductValidation = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const updateProductValidation = Joi.object({
  sellerid: Joi.string().hex().length(24),
  status: Joi.string(),
  id: Joi.string().hex().length(24),
  imgCover: Joi.string(),
  weight: Joi.string(),
  color: Joi.string(),
  size: Joi.string(),
  images: Joi.array().items(Joi.string()),
  title: Joi.string().trim().min(3),
  descripton: Joi.string().max(100).min(10).trim(),
  price: Joi.number().min(0).default(0),
  priceAfterDiscount: Joi.number().min(0).default(0),
  quantity: Joi.number().min(0).default(0),
  sold: Joi.number().min(0).default(0),
  category: Joi.string().hex().length(24),
  subcategory: Joi.string().hex().length(24),
  // brand: Joi.string().hex().length(24),
  ratingAvg: Joi.number().min(1).max(5),
  ratingCount: Joi.number().min(0),
});

const deleteProductValidation = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

export {
  addProductValidation,
  getSpecificProductValidation,
  updateProductValidation,
  deleteProductValidation,
};
