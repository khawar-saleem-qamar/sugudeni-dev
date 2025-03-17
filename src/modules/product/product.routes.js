import express from "express";
import * as product from "./product.controller.js";
import { validate } from "../../middlewares/validate.js";
import {
  addProductValidation,
  deleteProductValidation,
  getSpecificProductValidation,
  updateProductValidation,
} from "./product.validation.js";
import { uploadMultipleFiles } from "../../../multer/multer.js";
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js";

const productRouter = express.Router();

let arrFields = [
  { name: "imgCover", maxCount: 1 },
  { name: "images", maxCount: 8 },
];

productRouter
  .route("/")
  .post(
    protectedRoutes,
    allowedTo("admin", "seller"),
    uploadMultipleFiles(arrFields, "products"),
    validate(addProductValidation),
    product.addProduct
  )
  .patch(
    protectedRoutes,
    allowedTo("admin", "seller"),
    product.updateProductStatus
  )
  .get(product.getAllProducts);


productRouter
  .route("/seller/:id")
  .get(
    protectedRoutes,
    product.getSellerProducts
  )

productRouter
  .route("/popular")
  .get(
    product.getPopularProducts
  )

productRouter
  .route("/hot-deals")
  .get(
    product.getHotProducts
  )

productRouter
  .route("/featured")
  .patch(
    product.markFetauredProducts
  )
  .get(
    product.getFetauredProducts
  )

productRouter
  .route("/:id")
  .put(
    protectedRoutes,
    allowedTo("admin", "seller"),
    uploadMultipleFiles(arrFields, "products"),
    validate(updateProductValidation),
    product.updateProduct
  )
  .patch(
    product.updateProductSale
  )
  .delete(
    protectedRoutes,
    allowedTo("admin", "seller"),
    validate(deleteProductValidation),
    product.deleteProduct
  )
  .get(validate(getSpecificProductValidation), product.getSpecificProduct);

export default productRouter;
