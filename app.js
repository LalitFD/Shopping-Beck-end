import bodyParser from "body-parser";
import express, { Router } from "express"
import dotenv from "dotenv"
dotenv.config()
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import router from "./router/user.router.js";
import { Prouter } from "./router/post.router.js";
import Srouter from "./router/story.router.js";
import rrouter from "./router/reel.router.js";
import cors from "cors";

const app = express();

mongoose.connect(process.env.URL).then((result) => {
    app.use('/public', express.static('public'));
    app.use(bodyParser.json())
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser())

    app.use(cors({
        origin: "http://localhost:3001",
        credentials: true,
    }));


    app.use("/", router);
    app.use("/api", Prouter)
    app.use("/story", Srouter)
    app.use("/reel", rrouter)


    app.listen(process.env.PORT, () => {
        console.log("server started")
    })
}).catch((err) => {
    console.log(err)
    console.log("connnection  failed")
})
