import { Schema, model } from "mongoose";

const chatSchema = new Schema({
    senderid: { type: Schema.Types.ObjectId, required: true },
    receiverid: { type: Schema.Types.ObjectId, required: true },
    message:{type:String,default:""},
    media:{type:String,default:""},
    likedBy: [
        {type: Schema.Types.ObjectId}
    ],
    replyof: [
        {type: Schema.Types.ObjectId}
    ],
    read: {
        type: Boolean,
        default: false
    },
    delivered: {
        type: Boolean,
        default: false
    },
    seen: {
        type: Boolean,
        default: false
    },
    contentType: {
        type: String,
        default: ""
    }
},{timestamps:true})

export const Chat = model("chat", chatSchema);