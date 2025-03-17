import mongoose, { Schema, model }  from "mongoose";

const undersigninSchema = new Schema({
  phone: { type: String, default: "" },
  // email: { type: String, default: "" },
  otp: { type: String, default: "" },
  userid: { type: mongoose.Schema.Types.ObjectId, required: true }
});

export const undersigninModel = model("UnderSignin", undersigninSchema);
