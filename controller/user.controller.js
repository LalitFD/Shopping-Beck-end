import { User } from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer"
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";


export const login = async (request, response, next) => {
    try {
        const { email, password } = request.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return response.status(400).json({ message: "Invalid credentials" });
        }

        const isValidPassword = bcrypt.compareSync(password, user.password);
        if (!isValidPassword) {
            return response.status(400).json({ message: "Invalid credentials" });
        }

        else {
            user.password = undefined;

            const token = generateToken(user._id, user.email);

            response.cookie("token", token, {
                httpOnly: true,
                secure: true,
                sameSite: "None"
            });

            return response.status(200).json({ message: "Login success", token, user })
        }

    } catch (err) {
        console.log(err);
        return response.status(500).json({ message: "Internal server error" });
    }
};


export const ProfileUpload = async (request, response, next) => {
    try {
        //   const id = request.user._id;
        let user = await User.findById(request.user._id)

        user.profile.imageName = request.file.filename;
        user.save();
        return response.status(201).json({ message: "Profile udpated..." });

    } catch (err) {
        console.log(err)
        return response.status(500).json({ error: "internal server errror" })
    }
}

export const logOut = async (request, response, next) => {
    try {
        await response.clearCookie("token");
        return response.status(200).json({ message: "logout success" })
    } catch (err) {
        console.log(err)
        return response.status(500).json({ error: "Internal server error " })
    }
}


export const generateToken = (user) => {
    const payload = {
        _id: user._id,
        email: user.email,
        name: user.name,
        username: user.username
    };

    const token = jwt.sign(payload, process.env.secure_key, { expiresIn: "1d" });
    console.log("Generated Token:", token);

    return token;
};



export const sendEmail = (name, email, token) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.mail_id,
            pass: process.env.mail_password
        }
    });
    // const verifyUrl = `http://localhost:3000/verification?token=${token}&email=${email}`;
    
    const verifyUrl = `https://shopping-beck-end.onrender.com/verification?token=${token}&email=${email}`;

    let mailOptions = {
        from: process.env.mail_id,
        to: email,
        subject: 'Verify Your Account 😊',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Hello, ${name}</h2>
          <p style="font-size: 16px; color: #555;">
            Thank you for registering with us! Please click the button below to verify your account:
          </p>
          <a href="${verifyUrl}" 
             style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: #fff; 
                    font-size: 16px; border-radius: 6px; text-decoration: none; margin-top: 20px;">
            Verify Your Account
          </a>
          <p style="font-size: 14px; color: #777; margin-top: 30px;">
            If you did not register for this account, you can ignore this email.
          </p>
          <p style="font-size: 14px; color: #333;">
            Best regards,<br />
            <strong>Social Media - Lalit ✌️</strong>
          </p>
        </div>`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}


export const userVerified = async (request, response, next) => {
    try {
        // GET aur POST dono handle karo
        let { email, token } = request.method === 'GET' ? request.query : request.body;

        // Email clean karo
        email = email ? email.trim().replace(/\/$/, '') : null;

        console.log("Verification attempt:", { email, token, method: request.method });

        // Validation
        if (!email || !token) {
            return response.status(400).json({
                error: "Email and token are required"
            });
        }

        // User find karo with email and token
        const user = await User.findOne({
            email,
            verificationToken: token
        });

        if (!user) {
            // GET request hai to HTML response do, POST hai to JSON
            if (request.method === 'GET') {
                return response.status(400).send(`
                   <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
                       <h2 style="color: red;">❌ Invalid or Expired Verification Link</h2>
                       <p>The verification link is invalid or has already been used.</p>
                       <p>Please request a new verification email.</p>
                   </div>
               `);
            } else {
                return response.status(400).json({
                    error: "Invalid or expired verification token"
                });
            }
        }

        // User already verified hai?
        if (user.isVerified) {
            if (request.method === 'GET') {
                return response.status(200).send(`
                   <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
                       <h2 style="color: blue;">ℹ️ Account Already Verified</h2>
                       <p>Your account is already verified. You can login now.</p>
                   </div>
               `);
            } else {
                return response.status(200).json({
                    message: "Account already verified"
                });
            }
        }

        // User verify karo
        const updateResult = await User.updateOne(
            { email, verificationToken: token },
            {
                $set: { isVerified: true },
                $unset: { verificationToken: 1 }  // Token remove karo
            }
        );

        if (updateResult.matchedCount === 0) {
            return response.status(400).json({
                error: "Verification failed"
            });
        }

        console.log("User verified successfully:", email);

        // Success response
        if (request.method === 'GET') {
            return response.status(200).send(`
               <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
                   <h2 style="color: green;">✅ Account Verified Successfully!</h2>
                   <p>Congratulations! Your account has been verified.</p>
                   <p>You can now login to your account.</p>

               </div>
           `);
        } else {
            return response.status(200).json({
                message: "User verified successfully",
                success: true
            });
        }

    } catch (err) {
        console.error("Verification error:", err);

        if (request.method === 'GET') {
            return response.status(500).send(`
               <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
                   <h2 style="color: red;">⚠️ Server Error</h2>
                   <p>Something went wrong. Please try again later.</p>
               </div>
           `);
        } else {
            return response.status(500).json({
                error: "Internal server error"
            });
        }
    }
};

export const userProfile = async (request, response) => {
    try {
        const id = request.user._id;
        console.log("User ID from request:", id);

        if (!id) {
            return response.status(401).json({ message: "User Not Logged in!" });
        }

        const userProfile = await User.findById(id).lean();

        if (!userProfile) {
            return response.status(404).json({ message: "User Not Found!" });
        }

        return response.status(200).json({ message: "Profile Found!", userProfile });
    } catch (err) {
        console.error("Error in Finding User Profile ", err);
        return response.status(500).json({ error: "Internal Server Error" });
    }
};


export const profileUpdate = async (request, response) => {
    try {
        const id = request.user._id;
        const { name, username, bio } = request.body;

        if (!id) {
            return response.status(401).json({ message: "User Not Logged in!" });
        }

        const updatedUser = await User.findByIdAndUpdate(id, {
            name,
            username,
            bio
        }, { new: true });

        if (!updatedUser) {
            return response.status(404).json({ message: "User Not Found!" });
        }

        return response.status(200).json({ message: "Profile Updated Successfully!", updatedUser });
    } catch (err) {
        console.error("Error in Updating User Profile ", err);
        return response.status(500).json({ error: "Internal Server Error" });
    }
}

export const createProfile = async (request, response, next) => {
    try {
        let user = await User.findById(request.params.userId)

        user.profile.imageName = request.file.filename;
        user.profile.address = request.body.address;

        user.name = request.body.name ?? user.name;
        user.contact = request.body.contact ?? user.contact;

        user.save();
        return response.status(201).json({ message: "Profile udpated..." });

    } catch (err) {
        console.log(err)
        return response.status(500).json({ error: "internal server errror" })
    }
}

export const register = async (request, response, next) => {
    try {
        let { name, email, password, username } = request.body;

        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return response.status(400).json({
                message: "User with this email or username already exists"
            });
        }

        let saltKey = bcrypt.genSaltSync(12);
        password = bcrypt.hashSync(password, saltKey);

        // VERIFICATION TOKEN GENERATE KARO
        const verificationToken = Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);

        // Ya JWT use karo (better option)
        // const verificationToken = jwt.sign(
        //     { email, purpose: 'verification' },
        //     process.env.JWT_SECRET,
        //     { expiresIn: '24h' }
        // );

        let newUser = await User.create({
            name,
            email,
            password,
            username,
            isVerified: false,
            verificationToken
        });

        // EMAIL SEND KARO WITH TOKEN
        await sendEmail(name, email, verificationToken);

        return response.status(201).json({
            message: "User created. Check your email for verification",
            user: {
                name: newUser.name,
                email: newUser.email,
                username: newUser.username
            }
        });

    } catch (err) {
        console.log(err);
        return response.status(500).json({ message: "Internal server error" });
    }
};


export const fetchUser = async (request, response, next) => {
    try {
        let { userId } = request.params;
        let user = await User.findById(userId)

        // user.profile.imageName = "http://localhost:3000/profile/" + user.profile.imageName;
        return response.status(201).json({ user })

    } catch (err) {
        console.log(err)
        return response.status(500).json({ error: "Internal server error " })
    }
}


export const searchUsers = async (req, res) => {
    try {
        const query = req.query.query?.trim();

        if (!query) {
            return res.status(400).json({ error: "Search query is required" });
        }

        const currentUserId = req.user._id;

        const users = await User.find({
            _id: { $ne: currentUserId },
            $or: [
                { name: { $regex: query, $options: "i" } },
                { username: { $regex: query, $options: "i" } },
                { bio: { $regex: query, $options: "i" } },
            ],
        }).select("name username bio profilePic");

        return res.status(200).json({ users });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
};




export const followUnfollow = async (req, res) => {
    try {
        const currentUserId = req.user._id; 
        const targetUserId = req.params.id; 

        if (currentUserId.toString() === targetUserId.toString()) {
            return res.status(400).json({ message: "You can't follow yourself" });
        }

        const currentUser = await User.findById(currentUserId);
        const targetUser = await User.findById(targetUserId);

        if (!currentUser || !targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const isFollowing = currentUser.following.includes(targetUserId);

        if (isFollowing) {
            currentUser.following.pull(targetUserId);
            targetUser.followers.pull(currentUserId);
            await currentUser.save();
            await targetUser.save();
            return res.json({ message: "Unfollowed successfully" });
        } else {
            currentUser.following.push(targetUserId);
            targetUser.followers.push(currentUserId);
            await currentUser.save();
            await targetUser.save();
            return res.json({ message: "Followed successfully" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// export const googleLogin = async (req, res) => {
//     const { token } = req.body;

//     try {
//         const ticket = await client.verifyIdToken({
//             idToken: token,
//             audience: process.env.GOOGLE_CLIENT_ID,
//         });

//         const payload = ticket.getPayload();

//         const userToken = jwt.sign(
//             { email: payload.email, name: payload.name },
//             process.env.secure_key,
//             { expiresIn: "1d" }
//         );

//         res.cookie("token", userToken, {
//             httpOnly: true,
//             secure: true,
//             sameSite: "Lax",
//             maxAge: 24 * 60 * 60 * 1000,
//         });

//         res.status(200).json({ message: "Google login successful" });
//     } catch (error) {
//         console.error("Google Login Error:", error);
//         res.status(401).json({ message: "Google token invalid" });
//     }
// };




export const getFollowersAndFollowing = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate("followers", "name username profile.imageName")
            .populate("following", "name username profile.imageName");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            followers: user.followers,
            following: user.following
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
