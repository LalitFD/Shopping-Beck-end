import express from "express";
import { getAllStories, getStoryById, createStory, deleteStory, getStoriesByUser } from "../controller/story.controller.js";
import { auth } from "../middleware/auth.js";
import storyUpload from "../middleware/uploadStory.js";

const Srouter = express.Router();

Srouter.get("/stories", getAllStories);
Srouter.get("/stories/:id", getStoryById);
Srouter.post("/create", auth, storyUpload.single("media"), createStory);
Srouter.delete("/stories/:id", auth, deleteStory);
Srouter.get("/stories/user/:id", getStoriesByUser);

export default Srouter;