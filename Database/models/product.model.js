import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    sellerid: {
      type: Schema.ObjectId,
      ref: "user",
      required: true,
    },
    title: {
      type: String,
      trim: true,
      default: ""
    },
    imgCover: {
      type: String,
      default: ""
    },
    weight: {
      type: String,
      default: ""
    },
    color: {
      type: String,
      default: ""
    },
    size: {
      type: String,
      default: ""
    },
    images: {
      type: [String],
      default: []
    },
    descripton: {
      type: String,
      maxlength: [100, "Description should be less than or equal to 100"],
      trim: true,
      default: ""
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    priceAfterDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    saleDiscount: {
      type: Number,
      default: 0,
      min: 0
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    sold: {
      type: Number,
      default: 0,
      min: 0,
    },
    category: {
      type: Schema.ObjectId,
      ref: "category",
      default: ""
    },
    subcategory: {
      type: Schema.ObjectId,
      ref: "subcategory",
      default: ""
    },
    // brand: {
    //   type: Schema.ObjectId,
    //   ref: "brand",
    //   required: true,
    // },
    ratingAvg: {
      type: Number,
      min: 1,
      max: 5,
      default: 1
    },
    ratingCount: {
      type: Number,
      min: 0,
      default: 0
    },
    featured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "draft", "pendingqc", "violation", "outofstock"],
      default: "active"
    }
  },
  { timestamps: true ,toJSON: { virtuals: true },toObject: { virtuals: true } }
);

productSchema.post('init',function(doc){

  if(doc.imgCover && doc.images){

    doc.imgCover = `products/${doc.imgCover}`
    doc.images = doc.images.map((ele)=>{
     return `products/${ele}`
    })
  }

  
})

productSchema.virtual('reviews', {
  ref: 'review',
  localField: '_id',
  foreignField: 'productId',
});

productSchema.pre(['find','findOne'],function (){
  this.populate('reviews')
})

export const productModel = model("product", productSchema);


