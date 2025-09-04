import express from "express";

import { register, login, logOut, userVerified, userProfile, profileUpdate, searchUsers, ProfileUpload, followUnfollow, getFollowersAndFollowing, discoverUsers } from "../controller/user.controller.js";
import { auth } from "../middleware/auth.js";
import multer from "multer";

const router = express.Router();

const upload = multer({ dest: "public/profile" })


router.post("/register", register);

router.post("/login", login);

router.get("/logout", logOut);

router.get("/verification", userVerified);

router.post("/verification", userVerified);
router.post("/profile", auth, upload.single("imageName"), ProfileUpload);


router.get("/profile", auth, userProfile);

router.put("/update", auth, profileUpdate);

router.get("/searchUsers", auth, searchUsers);

router.post("/follow/:id", auth, followUnfollow);

router.get("/connection", auth, getFollowersAndFollowing)

router.get("/discover",auth,discoverUsers)
// router.post("/google-login",googleLogin) 

export default router;
