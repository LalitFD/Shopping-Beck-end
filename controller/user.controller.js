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



export const sendEmail = (name, email) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.mail_id,  // lalitdoriya7gmmail.com
            pass: process.env.mail_password   // 
        }
    });

    console.log(email);

    let mailOptions = {
        from: process.env.mail_id,
        to: email,
        subject: 'Verified Your Account 😊 ',
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
  <h2 style="color: #333;">Hello, ${name}</h2>
  <p style="font-size: 16px; color: #555;">
    Thank you for registering with us! Please click the button below to verify your account:
  </p>

  <form method="post" action="http://localhost:3000/verification" style="text-align: center; margin-top: 20px;">
    <input type="hidden" name="email" value="${email}" />
    <button type="submit" style="padding: 12px 24px; background-color: #007bff; color: #fff; font-size: 16px; border: none; border-radius: 6px; cursor: pointer;">
      Verify Your Account
    </button>
  </form>

  <p style="font-size: 14px; color: #777; margin-top: 30px;">
    If you did not register for this account, you can ignore this email.
  </p>

  <p style="font-size: 14px; color: #333;">
    Best regards,<br />
    <strong>E-commerce Creator</strong>
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
        let { email } = request.body; // doriyalalit8@gmail.com/ 
        email = email.trim().replace(/\/$/, '');

        console.log("Email received:", email);

        let v = await User.updateOne({ email }, { $set: { isVerified: true } });
        return response.status(200).json({ message: "User verified success", v });

    } catch (err) {
        console.log(err);
        return response.status(500).json({ error: "Internal server error" });
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

        await sendEmail(name, email);

        let newUser = await User.create({
            name,
            email,
            password,
            username
        });
        return response.status(201).json({ message: "user created", user: newUser });
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


export const followUser = async (request, response) => {
    try {
        const { userId } = request.params;
        const currentUserId = request.user._id;

        if (userId === currentUserId.toString()) {
            return response.status(400).json({ message: "You cannot follow yourself" });
        }

        const userToFollow = await User.findById(userId);
        if (!userToFollow) {
            return response.status(404).json({ message: "User not found" });
        }

        if (userToFollow.followers.includes(currentUserId)) {
            return response.status(400).json({ message: "You are already following this user" });
        }

        userToFollow.followers.push(currentUserId);
        await userToFollow.save();

        const currentUser = await User.findById(currentUserId);
        currentUser.following.push(userId);
        await currentUser.save();

        return response.status(200).json({ message: "Successfully followed the user", userToFollow });
    } catch (err) {
        console.error(err);
        return response.status(500).json({ error: "Internal server error" });
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
