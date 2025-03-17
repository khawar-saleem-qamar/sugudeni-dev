import mongoose, { Schema, model }  from "mongoose";

const underSignupSchema = new Schema({
  phone: { type: String, default: "" },
  email: { type: String, default: "" },
  otp: { type: String, default: "" },
  userid: { type: mongoose.Schema.Types.ObjectId, required: true }
});

export const undersignupModel = model("UnderSignup", underSignupSchema);
