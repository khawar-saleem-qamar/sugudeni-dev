import express from "express";
import * as chat from "./chat.controller.js";

const chatRouter = express.Router();

chatRouter
  .route("/threads/:userid")
  .get(
    chat.getThreads
  )

chatRouter
  .route("/chatHistory/:userid/:otherUserid")
  .get(
    chat.getChatHistory
  )

chatRouter
  .route("/markAsRead")
  .patch(
    chat.markAsRead
  )

chatRouter
  .route("/unreadCount/:userid")
  .get(
    chat.getUnreadCount
  )

export default chatRouter;
