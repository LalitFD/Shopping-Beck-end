import express from "express";
import multer from "multer";
import { getAllStories, getStoryById, createStory, deleteStory, getStoriesByUser } from "../controller/story.controller.js";
import { auth } from "../middleware/auth.js";



const Srouter = express.Router();
const upload = multer({ dest: "public/story" });

Srouter.get("/stories", getAllStories);
Srouter.get("/stories/:id", getStoryById);
Srouter.post("/create", auth, upload.single("media"), createStory);
Srouter.delete("/stories/:id", auth, deleteStory);
Srouter.get("/stories/user/:id", getStoriesByUser);

export default Srouter;
