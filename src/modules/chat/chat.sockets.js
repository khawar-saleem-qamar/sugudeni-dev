import { getThreads2 }  from "./chat.controller.js"
import { Server } from "socket.io";
import { Chat } from "./../../../Database/models/chat.model.js"
import { Thread } from "./../../../Database/models/thread.model.js"
import { userModel } from "../../../Database/models/user.model.js";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
const User = userModel

export function chatSockets(server){
    const io = new Server(server, {
        cors: {
          origins: "*",
        },
        maxHttpBufferSize: 1e8,
      });
      
      global.onlineSockets = new Map();
      
      
      function setSocket(userid, newsocket) {
        if (onlineSockets.get(userid)) {
          onlineSockets.get(userid).push(newsocket);
        } else {
          onlineSockets.set(userid, [newsocket]);
        }
      }
      
      io.on("connection", async (socket) => {
        const userid = socket.handshake.auth.userid;
      
        await User.findByIdAndUpdate(userid, {
          is_online: "1",
        });
      
        console.log(userid);
        setSocket(userid, socket);
      
        var unDeliveredChats = await Chat.find({
          receiverid: userid,
          delivered: false,
        });
      
        var senders = [];
      
        await Promise.all(
          unDeliveredChats.map(async (chat) => {
            await chat.updateOne({
              delivered: true,
            });
            if (!senders.includes(chat.senderid)) {
              senders.push(chat.senderid);
            }
          })
        );
      
        senders.forEach((senderid) => {
          const senderSockets = onlineSockets.get(senderid.toString());
          if (senderSockets) {
            for (const senderSocket of senderSockets) {
              senderSocket.emit("deliveredMessage", {
                receiverid: userid,
              });
            }
          }
        });
        const threads = await getThreads2(userid);
      
        await Promise.all(
          threads.map((thread) => {
            let receiverid;
            if (thread.participants[0].userid == userid) {
              receiverid = thread.participants[1].userid;
            } else {
              receiverid = thread.participants[0].userid;
            }
            receiverid = receiverid.toString();
            const receiverSockets = onlineSockets.get(receiverid);
            let threadUpdate = thread;
            if (receiverSockets) {
              for (const receiverSocket of receiverSockets) {
                if (receiverSocket) {
                  receiverSocket.emit("threadUpdate", threadUpdate);
                }
              }
            }
          })
        );
      
        socket.on("disconnect", async () => {
          let arr = onlineSockets.get(userid);
          arr = arr.filter((item) => item !== socket);
          if (arr.length == 0) {
            await User.findByIdAndUpdate(userid, {
              is_online: "0",
            });
            const user = await User.findById(userid);
          }
          onlineSockets.set(userid, arr);
          const threads = await getThreads2(userid);
      
          await Promise.all(
            threads.map((thread) => {
              let receiverid;
              if (thread.participants[0].userid == userid) {
                receiverid = thread.participants[1].userid;
              } else {
                receiverid = thread.participants[0].userid;
              }
              receiverid = receiverid.toString();
              const receiverSockets = onlineSockets.get(receiverid);
              let threadUpdate = thread;
              if (receiverSockets) {
                for (const receiverSocket of receiverSockets) {
                  if (receiverSocket) {
                    receiverSocket.emit("threadUpdate", threadUpdate);
                  }
                }
              }
            })
          );
        });

        socket.on("deleteMessage", async (data) => {
          try {
            const { chatid, senderid, receiverid } = data;
            const chat = await Chat.findById(chatid);
            await chat.deleteOne();
            const receiverSockets = onlineSockets.get(receiverid);
            if (receiverSockets) {
              for (const receiverSocket of receiverSockets) {
                if (receiverSocket) {
                  receiverSocket.emit("messageDeleted", { chatid, senderid });
                }
              }
            }
          } catch (error) {
            console.log(error);
          }
        });
      
        socket.on("sendMedia", async (data) => {
          try {
            const { messageid, senderid, receiverid, mimeType, file } = data;
            console.log(file);
            var mediaType = mimeType.split("/")[0];
            console.log(mediaType);
            const senderSockets = onlineSockets.get(senderid);
            const receiverSockets = onlineSockets.get(receiverid);
            const sender = await User.findById(senderid);
            const receiver = await User.findById(receiverid);
            if (!sender) {
              throw Error("Sender Not Found");
            }
            if (!receiver) {
              throw Error("Receiver Not Found");
            }
            const chat = await Chat.create({ senderid, receiverid });
      
            if (receiver.is_online == "1") {
              await chat.updateOne({
                delivered: true,
              });
      
              const senderSockets = onlineSockets.get(senderid);
              if (senderSockets) {
                for (const senderSocket of senderSockets) {
                  senderSocket.emit("deliveredMessage", {
                    receiverid,
                  });
                }
              }
            }
      
            const fileName = uuidv4() + " - " + file.originalname
            const filePath = path.join("uploads/chat", fileName);
            fs.writeFileSync(filePath, file);
      
            await chat.updateOne({
              media: `chat/${fileName}`,
            });
      
            const contentURL = `chat/${fileName}`
            let newMedia = {
              _id: chat._id,
              messageid,
              senderid,
              receiverid,
              contentType: mimeType,
              contentURL,
            };
      
            let thread = await Thread.findOne({
              $or: [
                { participantOneId: senderid, participantTwoId: receiverid },
                { participantOneId: receiverid, participantTwoId: senderid },
              ],
            });
            let threadExists = true;
            if (!thread) {
              threadExists = false;
              thread = await Thread.create({
                participantOneId: senderid,
                participantTwoId: receiverid,
              });
            }
            await thread.updateOne({
              last_message: "",
              last_message_sender_id: sender._id,
              last_message_Username: sender.username,
              last_message_timestamp: chat.createdAt,
              contentType: mimeType,
            });
      
            if (threadExists) {
              let threadUpdate = {
                _id: thread._id,
                last_message: "",
                last_message_sender_id: sender._id,
                last_message_Username: sender.username,
                last_message_timestamp: chat.createdAt,
                contentType: mimeType,
              };
      
              if (senderSockets) {
                var unreadCount = await Chat.countDocuments({
                  receiverid: senderid,
                  read: false,
                });
                for (const senderSocket of senderSockets) {
                  if (senderSocket) {
                    senderSocket.emit("threadUpdate", threadUpdate);
                    senderSocket.emit("newMedia", newMedia);
                    // senderSocket.emit("unreadMessagesCount", {
                    //   count: unreadCount
                    // })
                  }
                }
              }
              if (receiverSockets) {
                var unreadCount = await Chat.countDocuments({
                  receiverid: receiverid,
                  read: false,
                });
      
                for (const receiverSocket of receiverSockets) {
                  if (receiverSocket) {
                    receiverSocket.emit("threadUpdate", threadUpdate);
                    receiverSocket.emit("newMedia", newMedia);
                    receiverSocket.emit("unreadMessagesCount", {
                      count: unreadCount,
                    });
                  }
                }
              }
            } else {
              const user1 = await User.findById(thread.participantOneId);
              const user2 = await User.findById(thread.participantTwoId);
              let newThread = {
                _id: thread._id,
                participants: [
                  {
                    userid: user1._id,
                    username: user1.username,
                    is_online: user1.is_online,
                    profilePic: user1.profilePic,
                  },
                  {
                    userid: user2._id,
                    username: user2.username,
                    is_online: user2.is_online,
                    profilePic: user2.profilePic,
                  },
                ],
                last_message: "",
                last_message_sender_id: sender._id,
                last_message_Username: sender.username,
                last_message_timestamp: chat.createdAt,
                contentType: mimeType,
              };
              if (senderSockets) {
                for (const senderSocket of senderSockets) {
                  if (senderSocket) {
                    senderSocket.emit("newThread", newThread);
                    senderSocket.emit("newMedia", newMedia);
                  }
                }
              }
              if (receiverSockets) {
                for (const receiverSocket of receiverSockets) {
                  if (receiverSocket) {
                    receiverSocket.emit("newThread", newThread);
                    receiverSocket.emit("newMedia", newMedia);
                  }
                }
              }
            }
            // await sendNotification(
            //   receiverid,
            //   sender.username,
            //   `Sent you ${mediaType}`,
            //   "chat",
            //   chat._id
            // );
          } catch (error) {
            console.log(error);
          }
        });
      
        socket.on("seeMessage", async (data) => {
          try {
            const { senderid, userid } = data;
            var unSeenChats = await Chat.find({
              senderid,
              receiverid: userid,
              seen: false,
            });
      
            await Promise.all(
              unSeenChats.map(async (chat) => {
                await chat.updateOne({
                  seen: true,
                });
              })
            );
            const senderSockets = onlineSockets.get(senderid);
            if (senderSockets) {
              for (const senderSocket of senderSockets) {
                senderSocket.emit("seenMessage", {
                  receiverid: userid,
                });
              }
            }
          } catch (err) {
            console.log(err);
          }
        });
      
        socket.on("sendMessage", async (data) => {
          try {
            const { messageid, senderid, receiverid, message } = data;
            var senderSockets = onlineSockets.get(senderid);
            var receiverSockets = onlineSockets.get(receiverid);
            const sender = await User.findById(senderid);
            const receiver = await User.findById(receiverid);
            if (!sender) {
              throw Error("Sender Not Found");
            }
            if (!receiver) {
              throw Error("Receiver Not Found");
            }
      
            const chat = await Chat.create({ senderid, receiverid, message });
            if (receiver.is_online == "1") {
              await chat.updateOne({
                delivered: true,
              });
      
              const senderSockets = onlineSockets.get(senderid);
              if (senderSockets) {
                for (const senderSocket of senderSockets) {
                  senderSocket.emit("deliveredMessage", {
                    receiverid,
                  });
                }
              }
            }
            let thread = await Thread.findOne({
              $or: [
                { participantOneId: senderid, participantTwoId: receiverid },
                { participantOneId: receiverid, participantTwoId: senderid },
              ],
            });
            let threadExists = true;
            if (!thread) {
              threadExists = false;
              thread = await Thread.create({
                participantOneId: senderid,
                participantTwoId: receiverid,
              });
            }
            await thread.updateOne({
              last_message: message,
              last_message_sender_id: sender._id,
              last_message_Username: sender.username,
              last_message_timestamp: chat.createdAt,
              contentType: "",
            });
      
            if (threadExists) {
              let threadUpdate = {
                _id: thread._id,
                last_message: message,
                last_message_sender_id: sender._id,
                last_message_Username: sender.username,
                last_message_timestamp: chat.createdAt,
                contentType: "",
              };
      
              if (senderSockets) {
                var unreadCount = await Chat.countDocuments({
                  receiverid: senderid,
                  read: false,
                });
                for (const senderSocket of senderSockets) {
                  if (senderSocket) {
                    senderSocket.emit("threadUpdate", threadUpdate);
                    senderSocket.emit("newMessage", {
                      _id: chat._id,
                      messageid,
                      senderid,
                      receiverid,
                      message,
                    });
      
                    // senderSocket.emit("unreadMessagesCount", {
                    //   count: unreadCount
                    // })
                  }
                }
              }
              if (receiverSockets) {
                var unreadCount = await Chat.countDocuments({
                  receiverid: receiverid,
                  read: false,
                });
      
                for (const receiverSocket of receiverSockets) {
                  if (receiverSocket) {
                    receiverSocket.emit("threadUpdate", threadUpdate);
                    receiverSocket.emit("newMessage", {
                      _id: chat._id,
                      messageid,
                      senderid,
                      receiverid,
                      message,
                    });
                    receiverSocket.emit("unreadMessagesCount", {
                      count: unreadCount,
                    });
                  }
                }
              }
            } else {
              const user1 = await User.findById(thread.participantOneId);
              const user2 = await User.findById(thread.participantTwoId);
              let newThread = {
                _id: thread._id,
                participants: [
                  {
                    userid: user1._id,
                    username: user1.username,
                    is_online: user1.is_online,
                    profilePic: user1.profilePic,
                  },
                  {
                    userid: user2._id,
                    username: user2.username,
                    is_online: user2.is_online,
                    profilePic: user2.profilePic,
                  },
                ],
                last_message: message,
                last_message_sender_id: sender._id,
                last_message_Username: sender.username,
                last_message_timestamp: chat.createdAt,
                contentType: "",
              };
      
              if (senderSockets) {
                var unreadCount = await Chat.countDocuments({
                  receiverid: senderid,
                  read: false,
                });
                for (const senderSocket of senderSockets) {
                  if (senderSocket) {
                    senderSocket.emit("newThread", newThread);
                    senderSocket.emit("newMessage", {
                      _id: chat._id,
                      messageid,
                      senderid,
                      receiverid,
                      message,
                    });
      
                    // senderSocket.emit("unreadMessagesCount", {
                    //   count: unreadCount
                    // })
                  }
                }
              }
              if (receiverSockets) {
                var unreadCount = await Chat.countDocuments({
                  receiverid: receiverid,
                  read: false,
                });
      
                for (const receiverSocket of receiverSockets) {
                  if (receiverSocket) {
                    receiverSocket.emit("newThread", newThread);
                    receiverSocket.emit("newMessage", {
                      _id: chat._id,
                      messageid,
                      senderid,
                      receiverid,
                      message,
                    });
                    receiverSocket.emit("unreadMessagesCount", {
                      count: unreadCount,
                    });
                  }
                }
              }
            }
      
            // async function messageInfo(messageid){
            //   var chat = await Chat.findById(messageid);
            // }
      
            function truncateString(str, maxLength) {
              if (str.length > maxLength) {
                return str.substring(0, maxLength) + "...";
              }
              return str;
            }
            await sendNotification(
              receiverid,
              sender.username,
              truncateString(message, 20),
              "chat",
              senderid,
              null,
              null,
              senderid,
              sender.username,
              thread._id
            );
          } catch (error) {
            console.log(error);
          }
        });
      
        socket.on("likeMessage", async (data) => {
          try {
            console.log("worksdflka;");
            const { chatid, senderid, receiverid } = data;
            console.log("receiverid: ", receiverid);
            const receiverSockets = onlineSockets.get(receiverid);
            const senderSockets = onlineSockets.get(senderid);
            const sender = await User.findById(senderid);
            const receiver = await User.findById(receiverid);
            if (!sender) {
              throw Error("Sender Not Found");
            }
            if (!receiver) {
              throw Error("Receiver Not Found");
            }
      
            const chat = await Chat.findById(chatid);
            if (!chat) {
              throw Error("chat not found");
            }
      
            var liked = true;
            if (chat.likedBy.includes(senderid)) {
              await chat.updateOne({
                $pull: { likedBy: senderid },
              });
              liked = false;
            } else {
              await chat.updateOne({
                $push: { likedBy: senderid },
              });
            }
      
            let thread = await Thread.findOne({
              $or: [
                { participantOneId: senderid, participantTwoId: receiverid },
                { participantOneId: receiverid, participantTwoId: senderid },
              ],
            });
      
            if (!thread) {
              throw Error("Thread not found!");
            }
      
            console.log("outside");
            if (receiverSockets) {
              var unreadCount = await Chat.countDocuments({
                receiverid: receiverid,
                read: false,
              });
      
              for (const receiverSocket of receiverSockets) {
                if (receiverSocket) {
                  receiverSocket.emit("newLike", {
                    _id: chat._id,
                    senderid,
                    liked,
                  });
                  receiverSocket.emit("unreadMessagesCount", {
                    count: unreadCount,
                  });
                }
              }
            }
      
            if (senderSockets) {
              var unreadCount = await Chat.countDocuments({
                receiverid: senderid,
                read: false,
              });
      
              for (const senderSocket of senderSockets) {
                if (senderSocket) {
                  senderSocket.emit("newLike", {
                    _id: chat._id,
                    senderid,
                    liked,
                  });
                  senderSocket.emit("unreadMessagesCount", {
                    count: unreadCount,
                  });
                }
              }
            }
      
            // await sendNotification(receiverid, sender.username, "Liked a message", "chat", senderid, null, null, null, sender.username, thread._id)
          } catch (error) {
            console.log(error);
          }
        });
      });
}