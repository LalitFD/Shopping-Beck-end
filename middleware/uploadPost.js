
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./clodnary.js";

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "public/post",
        allowed_formats: ["jpg", "png", "jpeg", "webp", "mp4", "mov", "avi", "mkv"]
    }
});

const uploads = multer({ storage: storage });

export default uploads;
