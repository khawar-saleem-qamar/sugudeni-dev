import mongoose, { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const bankSchema = new Schema(
  {
    accountTitle: {
      type: String,
      default: ""
    },
    accountNumber: {
      type: String,
      default: ""
    },
    bankName: {
      type: String,
      default: ""
    },
    bankCode: {
      type: String,
      default: ""
    },
    iban: {
      type: String,
      default: ""
    },
    chequeCopy: {
      type: String,
      default: ""
    },
  }
)

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    firstname: {
      type: String,
      trim: true,
    },
    lastname: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    passwordChangedAt:Date,
    role: {
      type: String,
      enum: ["admin", "user", "driver", "seller"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    walletid: {
      type: mongoose.Schema.Types.ObjectId
    },
    profilePic: {
      type: String,
      default: ""
    },

    // driver included schema:
    licenseNumber: {
      type: String,
      default: ""
    },
    bikeRegistrationNumber: {
      type: String,
      default: ""
    },
    licenseFront: {
      type: String,
      default: ""
    },
    licenseBack: {
      type: String,
      default: ""
    },
    drivingSince: {
      type: Date,
      default: null
    },
    dob:{
      type: Date,
      default: null
    },

    //seller included schema:
    bankDetail: bankSchema,
    
    wishlist:[{type:Schema.ObjectId,ref : 'product'}],
    addresses:[{
      city:String,
      street:String,
      phone:String
    }]
  },
  { timestamps: true }
);

userSchema.pre("save", function () {
  this.password = bcrypt.hashSync(this.password, 8);
});
  
userSchema.pre("findOneAndUpdate", function () {
  if(this._update.password){
    this._update.password = bcrypt.hashSync(this._update.password, 8);
  }
  if(this._update.licenseFront){
    this._update.licenseFront = `/licenses/${this._update.licenseFront}`;
  }
  if(this._update.licenseBack){
    this._update.licenseBack = `/licenses/${this._update.licenseBack}`;
  }
});

export const userModel = model("user", userSchema);
