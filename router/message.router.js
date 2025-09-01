import express from "express";
import { createMessage, getMessage, getMessageById, getChatHistory } from "../controller/message.controller.js";
import { auth } from "../middleware/auth.js";

const MRouter = express.Router();

MRouter.get("/messages/:receiverId", auth, getMessage);
MRouter.post("/messages/:receiverId", auth, createMessage); 
MRouter.get("/message/:messageId", getMessageById);
MRouter.get("/chat/:senderId/:receiverId", getChatHistory);

export default MRouter; 