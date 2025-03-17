import { Schema,model } from "mongoose";


const saleSchema = new Schema({
    products:[
        {
            productId:{type:Schema.ObjectId, ref : "product"}
        }
    ],
    tag:{
        type: String,
        required: true
    },
    title:{
        type:String,
        required: true
    },
    tagline:{
        type: String,
        required: true
    },
    link:{
        type:String,
        required: true
    },
    position: {
        type: String,
        enum: ["head", "mid", "banner"]
    },
    banner: {
        type: String
    }
})
saleSchema.post('init',function(doc){
    // if(doc.banner){
      doc.banner = `sale/${doc.banner}`
    // }
})
export const saleModel = model('sale',saleSchema)