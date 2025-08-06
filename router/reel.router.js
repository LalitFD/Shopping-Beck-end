import express from "express";
import multer from "multer";

import { getAllReels, fetchAndSaveReels, getReelById, createReel, deleteReel, getReelsByUser } from "../controller/reel.controller.js";
import { auth } from "../middleware/auth.js";
const upload = multer({ dest: "public/reel" });

const rrouter = express.Router();

rrouter.get("/reels", getAllReels);

rrouter.post("/fetch-pexels", fetchAndSaveReels);

rrouter.get("/reels/:id", getReelById);

rrouter.post("/reels", auth, upload.single("videoUrl"), createReel);

rrouter.delete("/reels/:id", auth, deleteReel);

rrouter.get("/reels/user/:userId", getReelsByUser);

export default rrouter;
