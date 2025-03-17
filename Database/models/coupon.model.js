import { Schema, model } from "mongoose";

const couponSchema = new Schema(
  {
    seller: {
      type: Schema.ObjectId,
      ref: "user",
      required: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      unique:true
    },
    expires: {
      type: Date,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

export const couponModel = model("coupon", couponSchema);
