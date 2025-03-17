import Joi from "joi";

const addUserValidation = Joi.object({
  name: Joi.string().required().trim(),
  email: Joi.string().required().trim(),
  password: Joi.string().required(),
});

const updateUserValidation = Joi.object({
  name: Joi.string().trim(),
  password: Joi.string(),
  id: Joi.string().hex().length(24).required(),
});

const changeUserPasswordValidation = Joi.object({
  password: Joi.string().required(),
  id: Joi.string().hex().length(24).required(),
});

const deleteUserValidation = Joi.object({
  id: Joi.string().hex().length(24).required(),
});


//driver validations
const updateDriverValidation = Joi.object({
  licenseNumber: Joi.string().trim(),
  bikeRegistrationNumber: Joi.string().trim(),
  licenseFront: Joi.string(),
  licenseBack: Joi.string(),
  drivingSince: Joi.date(),
  dob: Joi.date(),
  firstname: Joi.string(),
  lastname: Joi.string(),
  password: Joi.string(),
  email: Joi.string(),
  phone: Joi.string(),
});


//seller validations
const updateSellerAccountSettingValidation = Joi.object({
  name: Joi.string().trim(),
  email: Joi.string().trim(),
  phone: Joi.string(),
  password: Joi.string()
});


export {
  addUserValidation,
  updateUserValidation,
  changeUserPasswordValidation,
  deleteUserValidation,
  updateDriverValidation,
  updateSellerAccountSettingValidation
};
