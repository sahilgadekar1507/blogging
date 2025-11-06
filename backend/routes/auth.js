import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs';
import {body, validationResult} from 'express-validator';
import dotenv from 'dotenv';
import User from "../models/User.js";

dotenv.config();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "defaultsecret";

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
            const payload = {user: {id: user.id}};
            const token = jwt.sign(payload, JWT_SECRET, {expiresIn: "1h"});

            res.status(201).json({token, message: "User registred successfully!"});
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

            const payload = {user: {id: user.id}};
            const token = jwt.sign(payload, JWT_SECRET, {expiresIn: "1h"});

            res.json({token, message: "login successful!"});
        } catch (error) {
            console.error(error.message);
            res.status(500).json({message: "server error"});
        }
    }
);

export default router;