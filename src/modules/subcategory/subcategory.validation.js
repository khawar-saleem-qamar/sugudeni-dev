import Joi from "joi";

const addSubCategoryValidation = Joi.object({
  name: Joi.string().required().min(2).trim(),
  categoryId: Joi.string().hex().length(24).required(),
});

const updateSubCategoryValidation = Joi.object({
  id: Joi.string().hex().length(24).required(),
  name: Joi.string().required().min(2).trim(),
  categoryId: Joi.string()
});

const deleteSubCategoryValidation = Joi.object({
  id: Joi.string().hex().length(24).required(),
  categoryId: Joi.string()
});

export {
  addSubCategoryValidation,
  updateSubCategoryValidation,
  deleteSubCategoryValidation,
};
