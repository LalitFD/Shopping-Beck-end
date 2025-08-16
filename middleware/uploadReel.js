import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./clodnary.js";

const reelStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "uploads/reel",
        resource_type: "auto",
        allowed_formats: ["jpg", "png", "jpeg", "webp", "mp4", "mov", "avi", "mkv"]
    }
});

const reelUpload = multer({ storage: reelStorage });

export default reelUpload;

