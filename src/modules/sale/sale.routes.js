import express from "express";
import { validate } from "../../middlewares/validate.js";
import {
  createSaleValidation,
  updateSaleValidation
} from "./sale.validation.js";
import { uploadSingleFile } from "../../../multer/multer.js";
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js";
import * as sale from "../sale/sale.controller.js"
const saleRouter = express.Router();

saleRouter
  .route("/")
  .post(
    // protectedRoutes,
    // allowedTo("admin"),
    uploadSingleFile("banner", "sale"),
    validate(createSaleValidation),
    sale.createSale
  )
 .get(
    sale.getSales
  )

saleRouter
  .route("/:id")
  .patch(
    // protectedRoutes,
    // allowedTo("admin"),
    uploadSingleFile("banner", "sale"),
    validate(updateSaleValidation),
    sale.updateSale
  )
export default saleRouter;
