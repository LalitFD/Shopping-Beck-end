import express from "express";
import multer from "multer";
import { auth } from "../middleware/auth.js";
import { getAllPosts, getPost, createPost, toggleLike, addComment, deletePost, getLoggedInUserPosts } from "../controller/post.controller.js";
import uploads from "../middleware/uploadPost.js";


// import uploads from "../middleware/uploadPost.js";
// const upload = multer({ dest: "public/post" })



const Prouter = express.Router();

Prouter.get("/getAllPost", getAllPosts);
Prouter.get("/getPost/:id", getPost);

Prouter.post("/createPost", auth, uploads.single("media"), createPost)
// Prouter.post("/createPost", auth, upload.single("media"), createPost)

Prouter.put("/like/:id", auth, toggleLike)
Prouter.post("/comment/:id", auth, addComment);
Prouter.delete("/deletePost/:id", auth, deletePost)
Prouter.get("/getPost", auth, getLoggedInUserPosts)



export { Prouter };