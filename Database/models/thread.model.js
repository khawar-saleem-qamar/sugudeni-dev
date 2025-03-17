import { Schema, model } from "mongoose";

const threadSchema = new Schema({
    participantOneId:{type:Schema.Types.ObjectId},
    participantTwoId:{type:Schema.Types.ObjectId},
    contentType:{type:String,default:""},
    last_message:{type:String,default:""},
    last_message_sender_id:{type:Schema.Types.ObjectId},
    last_message_Username:{type:String},
    last_message_timestamp:{type:Date},
})




export const Thread = model("thread", threadSchema);