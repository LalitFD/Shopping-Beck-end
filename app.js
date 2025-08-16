import bodyParser from "body-parser";
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import router from "./router/user.router.js";
import { Prouter } from "./router/post.router.js";
import Srouter from "./router/story.router.js";
import rrouter from "./router/reel.router.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
import { User } from "./models/User.js";
import MRouter from "./router/message.router.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

app.use(cors({
    // origin: "http://localhost:3001",
    origin: "https://shopping-front-end-enks.onrender.com",
    credentials: true,
}));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/public', express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/users", async (req, res) => {
    try {
        const users = await User.find({}, "username email name isVerified");
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const io = new Server(httpServer, {
    cors: {
        // origin: "http://localhost:3001",
        origin: "https://shopping-front-end-enks.onrender.com",
        credentials: true,
    }
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("register", (userId) => {
        onlineUsers.set(socket.id, userId);
        io.emit("online_users", Array.from(new Set(onlineUsers.values())));
    });

    socket.on("private_message", ({ senderId, receiverId, text }) => {
        io.emit("receive_private_message", { senderId, receiverId, text });
    });

    socket.on("disconnect", () => {
        onlineUsers.delete(socket.id);
        io.emit("online_users", Array.from(new Set(onlineUsers.values())));
        console.log("User disconnected:", socket.id);
    });
});

mongoose.connect(process.env.URL)
    .then(() => {
        app.use("/", router);
        app.use("/api", Prouter);
        app.use("/story", Srouter);
        app.use("/reel", rrouter);
        app.use("/Msg", MRouter);

        httpServer.listen(process.env.PORT, () => {
            console.log("Server + Socket.io started on port", process.env.PORT);
        });
    })
    .catch((err) => {
        console.log(err);
        console.log("Connection failed");
    });
