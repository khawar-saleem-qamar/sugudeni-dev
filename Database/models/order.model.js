import { Schema,model } from "mongoose";


const orderSchema = new Schema({
    userId:{
        type:Schema.ObjectId,
        required:true,
        ref:'user'
    },
    cartItem:[
        {
            productId:{type:Schema.ObjectId, ref : "product"},
            quantity:{
              type:Number,
              default:1
            },
            price:Number,
            totalProductDiscount:Number
          }
    ],
    shippingAddress:{
        street:String, 
        city:String,
        phone:Number
    },
    paymentMethod:{
        type:String,
        enum:['card','cash'],
        default:'cash'
    },
    isPaid:{
        type:Boolean,
        default:false
    },
    isDelivered:{
        type:Boolean,
        default:false
    },
    paidAt:Date,
    deliveredAt:Date,
    status: {
        type: String,
        enum: ["toship", "shippping", "delivered", "failed"]
    }
})

// Pre-save middleware to update fields based on status
orderSchema.pre("findOneAndUpdate", function (next) {
    if (this.isModified("status") && this.status === "delivered") {
        this.isPaid = true;
        this.isDelivered = true;
        this.paidAt = this.paidAt || new Date(); // Set paidAt only if not already set
        this.deliveredAt = new Date();
    }
    next();
});

export const orderModel = model('order',orderSchema)