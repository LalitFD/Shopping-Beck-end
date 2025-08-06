import express from "express";


import { register, login, logOut, userVerified, userProfile, profileUpdate, searchUsers,followUser } from "../controller/user.controller.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Logout
router.get("/logout", logOut);

// Email Verification
router.post("/verification", userVerified);

// Profile (protected route)
router.get("/profile", auth, userProfile);

router.put("/update", auth, profileUpdate);

router.get("/searchUsers", auth, searchUsers);

router.post("/follow/:id", auth, followUser);

export default router;
