import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs';
import {body, validationResult} from 'express-validator';
import dotenv from 'dotenv';
import User from "../models/User.js";

dotenv.config();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "defaultsecret";
const ACCESS_TOKEN_EXP = process.env.ACCESS_TOKEN_EXP || "15m";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "defaultsecret";
const REFRESH_EXP = process.env.REFRESH_EXP || "7d";

let refreshTokens = [];

const generateTokens = (user) => {
    const payload = {user: {id: user.id}};

    const accessToken = jwt.sign(payload, JWT_SECRET, {expiresIn: ACCESS_TOKEN_EXP});
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {expiresIn: REFRESH_EXP});

    refreshTokens.push(refreshToken);

    return {accessToken, refreshToken}
}

router.post(
    "/register", 
    [
        body("name", "name is required").notEmpty(),
        body("email", "please enter the valid email").isEmail(),
        body("password", "password must be 5 characters").isLength({min: 5}),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        };

        const {name, email, password} = req.body;

        try {
            let user = await User.findOne({email});
            
            if (user) {
                return res.status(400).json({message: "User already exists!"});
            }


            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            user = new User({
                name,
                email,
                password: hashedPassword
            });

            await user.save();

            // create JWT token
            // const payload = {user: {id: user.id}};
            // const token = jwt.sign(payload, JWT_SECRET, {expiresIn: ACCESS_TOKEN_EXP});

            const token = generateTokens(user)

            // const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {expiresIn: REFRESH_EXP});

            // refreshToken.push(refreshToken);
            

            res.status(201).json({message: "User registred successfully!",
                ...tokens
            });
        } catch (err) {
            console.log(err.message);
            res.status(500).json({message: "Server error!"})
        }
    }
);

router.post(
    "/login", 
    [
        body("email", "please include valid email!").isEmail(),
        body("password", "password is required!").exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        };

        const {email, password} = req.body; 

        try {
            const user = await User.findOne({email});
            if (!user) {
                return res.status(400).json({message: "invalid credentials!"});
            };

            const isMatch = await bcrypt.compare(password, user.password);
            if(!isMatch){
                return res.status(400).json({message: "invalid credentials!"});
            }

            // const payload = {user: {id: user.id}};
            // const token = jwt.sign(payload, JWT_SECRET, {expiresIn: "1h"});

            const tokens = generateTokens(user);

            res.json({message: "login successful!", ...tokens});
        } catch (error) {
            console.error(error.message);
            res.status(500).json({message: "server error"});
        }
    }
);

router.post("/refresh",
    async (req, res) => {
        const {refreshToken} = req.body;

        if (!refreshToken) {
            return res.status(401).json({message: "refresh token required!"});
        };

        if (!refreshTokens.includes(refreshToken)) {
            return res.status(403).json({message: "invalid refresh token!"});
        }

        try {
            const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
            const payload = {user: {id: decoded.user.id}};

            const accessToken = jwt.sign(payload, JWT_SECRET, {expiresIn: ACCESS_TOKEN_EXP});

            res.json({accessToken});
        } catch (error) {
            console.error(error.message);
            res.status(403).json({message: "invalid or expired refresh token"});
        }
    }
);

router.post("/logout",
    (req, res) => {
        const {refreshToken} = req.body;
        refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
        res.json({message: "logged out successfully!"});
    }
);

export default router;