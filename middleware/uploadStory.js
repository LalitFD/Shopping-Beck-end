import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./clodnary.js";
// import cloudinary from "./cloudinary.js"; // Fix typo: clodnary → cloudinary

const storyStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "uploads/story",
        allowed_formats: ["jpg", "png", "jpeg", "webp", "mp4", "mov", "avi", "mkv"]
    }
});

const storyUpload = multer({ storage: storyStorage });

export default storyUpload;