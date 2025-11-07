import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "defaultsecret";

const auth = (req, res, next) => {
    try {
        const authHeader = req.header("Authorization") || "";
        const token = authHeader.startsWith("Bearer")
        ? authHeader.slice(7).trim()
        : authHeader.trim();


        if(!token) {
            return res.status(401).json({message: "No token!, authorization denied"})
        };


        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = decoded.user;
        return next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({message: "Access token expired!"});
        }
        return res.status(401).json({message: "Token is not valid!"});
    }
};

export default auth;