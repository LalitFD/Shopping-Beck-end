import express from "express";
import multer from "multer";
import path from "path";
import { getAllReels, getReelById, createReel, deleteReel } from "../controller/reel.controller.js";
import { auth } from "../middleware/auth.js"
import uploads from "../middleware/uploadReel.js";

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "public/reel");
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, 'reel-' + uniqueSuffix + path.extname(file.originalname));
//     }
// });

// const fileFilter = (req, file, cb) => {
//     if (file.mimetype.startsWith('video/')) {
//         cb(null, true);
//     } else {
//         cb(new Error('Only video files are allowed!'), false);
//     }
// };

// const upload = multer({
//     storage: storage,
//     fileFilter: fileFilter,
//     limits: {
//         fileSize: 100 * 1024 * 1024,
//     }
// });

const rrouter = express.Router();

rrouter.get("/reels", getAllReels);
rrouter.get("/reels/:id", getReelById);
rrouter.post("/reels", auth, uploads.single("video"), createReel);
rrouter.delete("/reels/:id", auth, deleteReel);

export default rrouter;