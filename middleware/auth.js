import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";

export const auth = async (request, response, next) => {
    try {
        let token = request.cookies.token;

        if (!token) {
            return response.status(401).json({ message: "Unauthorized user. No token provided." });
        }

        let decode = jwt.verify(token, process.env.secure_key);
        request.user = decode;
        next();
    } catch (err) {
        console.log("JWT Verification Error:", err);
        return response.status(401).json({ error: "Unauthorized user | Invalid token" });
    }
};
