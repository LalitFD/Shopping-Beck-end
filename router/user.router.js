import express from "express";

import { register, login, logOut, userVerified, userProfile, profileUpdate, searchUsers, followUser,ProfileUpload} from "../controller/user.controller.js";
import { auth } from "../middleware/auth.js";
import multer from "multer";

const router = express.Router();

const upload = multer({ dest: "public/profile" })


// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Logout
router.get("/logout", logOut);

// Email Verification
router.post("/verification", userVerified);

router.post("/profile", auth, upload.single("imageName"), ProfileUpload);


// Profile (protected route)
router.get("/profile", auth, userProfile);

router.put("/update", auth, profileUpdate);

router.get("/searchUsers", auth, searchUsers);

router.post("/follow/:id", auth, followUser);

// router.post("/google-login",googleLogin)

export default router;
