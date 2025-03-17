
import { userModel } from "../../../Database/models/user.model.js";
import { Chat } from "./../../../Database/models/chat.model.js"
import { Thread } from "./../../../Database/models/thread.model.js"

import dotenv from "dotenv";
dotenv.config();

const getChatHistory = async (req, res) => {
    try {
        const { userid, otherUserid } = req.params;

        let chats = await Chat.find({
            $or: [
                { senderid: userid, receiverid: otherUserid },
                { senderid: otherUserid, receiverid: userid }
            ]
        }).sort({ createdAt: 'desc' });
        let chat = []

        for (let c of chats) {
            c = c.toObject()
            c.contentURL = ""
            c.contentType = ""
            if(c.likedBy && c.likedBy.length > 0){
                c["liked"] = true;
            }else{
                c["liked"] = false;
            }
            delete c.media
            chat.push(c)
        }

        res.status(200).json({ chat });
    } catch (error) {
        res.status(400).json({
            error: error.message
        })
    }
}
// const { getPicUrl } = require("../controllers/userController")

const getThreads = async (req, res) => {
    try {
        const userid = req.params.userid
        let threads = await Thread.find({ $or: [{ participantOneId: userid }, { participantTwoId: userid }] })

        threads = await Promise.all(
            threads.map(async (thread) => {
                const user1 = await userModel.findById(thread.participantOneId)
                const user2 = await userModel.findById(thread.participantTwoId)
                var otherUserId = thread.participantOneId;
                if(thread.participantOneId == userid){
                    otherUserId = thread.participantTwoId;
                }
                var unreadCount = await Chat.countDocuments({
                    receiverid: userid,
                    senderid: otherUserId.toString(),
                    read: false,
                  });
                return {
                    _id: thread._id,
                    participants: [{
                        userid: user1._id,
                        username: user1.username,
                        is_online: user1.is_online,
                        profilePic: user1.profilePic
                    }, {
                        userid: user2._id,
                        username: user2.username,
                        is_online: user2.is_online,
                        profilePic: user2.profilePic
                    }],
                    last_message: thread.last_message,
                    last_message_sender_id: thread.last_message_sender_id,
                    last_message_Username: thread.last_message_Username,
                    last_message_timestamp: thread.last_message_timestamp,
                    contentType: thread.contentType,
                    unreadCount
                }
            })
        )

        res.status(200).json({
            threads
        })

    } catch (error) {
        res.status(400).json({
            error: error.message
        })
    }
}
const getThreads2 = async (userid) => {
    try {
        let threads = await Thread.find({ $or: [{ participantOneId: userid }, { participantTwoId: userid }] })

        threads = await Promise.all(
            threads.map(async (thread) => {
                const user1 = await userModel.findById(thread.participantOneId)
                const user2 = await userModel.findById(thread.participantTwoId)
                var otherUserId = thread.participantOneId;
                if(thread.participantOneId == userid){
                    otherUserId = thread.participantTwoId;
                }
                var unreadCount = await Chat.countDocuments({
                    receiverid: userid,
                    senderid: otherUserId.toString(),
                    read: false,
                  });
                return {
                    _id: thread._id,
                    participants: [{
                        userid: user1._id,
                        username: user1.username,
                        is_online: user1.is_online,
                        profilePic: user1.profilePic
                    }, {
                        userid: user2._id,
                        username: user2.username,
                        is_online: user2.is_online,
                        profilePic: user2.profilePic
                    }],
                    last_message: thread.last_message,
                    last_message_sender_id: thread.last_message_sender_id,
                    last_message_Username: thread.last_message_Username,
                    last_message_timestamp: thread.last_message_timestamp,
                    contentType: thread.contentType,
                    unreadCount
                }
            })
        )

        return threads

    } catch (error) {
        console.log(error)
    }
}
const markAsRead = async (req, res) => {
    try{
    var {userid, otheruserid} = req.body;
    var chats = await Chat.find({
      receiverid: userid,
      senderid: otheruserid,
      read: false
    });
  
    await Promise.all(
      chats.map(async chat =>{
        await chat.updateOne({
            read: true
        })
      })
    )

    var socketActivity = global.onlineSockets.get(userid.toString());

    if (socketActivity) {
        var unreadCount = await Chat.countDocuments({ receiverid: userid, read: false })
        for (const socket of socketActivity) {
            if (socket) {
                socket.emit("unreadMessagesCount", {
                count: unreadCount
                });
            }
        }
    }
  
    res.status(200).json({
      message: "chat read"
    })
  }catch(err){
    res.status(400).json({
      error: err.message
    })
  }
}
const getUnreadCount = async (req, res) => {
try{
    const userid = req.params.userid
var chats = await Chat.countDocuments({
    receiverid: userid,
    read: false
});

res.status(200).json({
    count: chats
})
}catch(err){
res.status(400).json({
    error: err.message
})
}
}
export { getChatHistory, getThreads, getThreads2, markAsRead,getUnreadCount }