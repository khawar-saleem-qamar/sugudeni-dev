import Joi from "joi";

const createSaleValidation = Joi.object({
  banner: Joi.string(),
  title: Joi.string(),
  tag: Joi.string(),
  tagline: Joi.string(),
  link: Joi.string(),
  position: Joi.string(),
});

const updateSaleValidation = Joi.object({
    id: Joi.string().hex().length(24),
    banner: Joi.string(),
    title: Joi.string(),
    tag: Joi.string(),
    tagline: Joi.string(),
    link: Joi.string(),
    position: Joi.string(),
});
  
export {
    createSaleValidation,
    updateSaleValidation
};
