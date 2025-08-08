import express from "express";
import multer from "multer";
import { getAllStories, getStoryById, createStory, deleteStory, getStoriesByUser } from "../controller/story.controller.js";
import { auth } from "../middleware/auth.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const Srouter = express.Router();

const uploadDir = path.join(__dirname, '../uploads/story');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
    dest: uploadDir,
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

Srouter.get("/stories", getAllStories);
Srouter.get("/stories/:id", getStoryById);
Srouter.post("/create", auth, upload.single("media"), createStory);
Srouter.delete("/stories/:id", auth, deleteStory);
Srouter.get("/stories/user/:id", getStoriesByUser);

export default Srouter;