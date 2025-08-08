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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

mongoose.connect(process.env.URL).then(() => {
    app.use('/public', express.static('public'));
    // app.use('/story', express.static(path.join(__dirname, 'uploads/story')));

    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


    app.use(bodyParser.json());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    app.use(cors({
        origin: "http://localhost:3001",
        credentials: true,
    }));

    app.use("/", router);
    app.use("/api", Prouter);
    app.use("/story", Srouter);
    app.use("/reel", rrouter);

    app.listen(process.env.PORT, () => {
        console.log("Server started on port", process.env.PORT);
    });
}).catch((err) => {
    console.log(err);
    console.log("Connection failed");
});