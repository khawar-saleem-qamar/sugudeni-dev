import express from "express";
// import { validate } from "../../middlewares/validate.js";

import { allowedTo, protectedRoutes } from "../auth/auth.controller.js";
import { validate } from "../../middlewares/validate.js";
import * as order from "../order/order.controller.js"
import { updateOrderStatusValidation } from "./order.validation.js";
const orderRouter = express.Router();



orderRouter
  .route("/:id")
  .post(
    protectedRoutes,
    allowedTo("user"),
    order.createCashOrder
  )
orderRouter
  .route("/")
  .get(
    protectedRoutes,
    allowedTo("user"),
    order.getSpecificOrder
  )

  orderRouter.post('/checkOut/:id' ,protectedRoutes, allowedTo("user"), order.createCheckOutSession)

  orderRouter.get('/all',order.getAllOrders)

  // User Routes
orderRouter.get("/user", protectedRoutes, allowedTo("user", "admin"), order.getUserOrders);

  // Seller Routes
orderRouter.get("/seller", protectedRoutes, allowedTo("seller", "admin"), order.getSellerOrders);
orderRouter.put(
  "/status/:id",
  protectedRoutes,
  allowedTo("seller"),
  validate(updateOrderStatusValidation),
  order.updateOrderStatus
);
export default orderRouter;
