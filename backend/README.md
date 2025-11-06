// routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();
const router = express.Router();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXP = process.env.ACCESS_TOKEN_EXP || "15m";
const REFRESH_EXP = process.env.REFRESH_TOKEN_EXP || "7d";

// Temporary store (later you can use DB or Redis)
let refreshTokens = [];

// 🔹 Helper to generate tokens
const generateTokens = (user) => {
  const payload = { user: { id: user.id } };

  const accessToken = jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXP,
  });

  const refreshToken = jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXP,
  });

  refreshTokens.push(refreshToken);

  return { accessToken, refreshToken };
};

// =======================================================
// @route   POST /api/auth/register
// @desc    Register a new user
// =======================================================
router.post(
  "/register",
  [
    body("name", "Name is required").notEmpty(),
    body("email", "Please include a valid email").isEmail(),
    body("password", "Password must be 6+ characters").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: "User already exists" });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = new User({ name, email, password: hashedPassword });
      await user.save();

      const tokens = generateTokens(user);
      res.status(201).json({
        message: "User registered successfully",
        ...tokens,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

// =======================================================
// @route   POST /api/auth/login
// @desc    Login user and issue tokens
// =======================================================
router.post(
  "/login",
  [
    body("email", "Please include a valid email").isEmail(),
    body("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "Invalid credentials" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

      const tokens = generateTokens(user);
      res.json({ message: "Login successful", ...tokens });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

// =======================================================
// @route   POST /api/auth/refresh
// @desc    Refresh access token using refresh token
// =======================================================
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(401).json({ message: "Refresh token required" });

  if (!refreshTokens.includes(refreshToken))
    return res.status(403).json({ message: "Invalid refresh token" });

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const payload = { user: { id: decoded.user.id } };

    const accessToken = jwt.sign(payload, ACCESS_SECRET, {
      expiresIn: ACCESS_EXP,
    });

    res.json({ accessToken });
  } catch (err) {
    console.error(err.message);
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
});

// =======================================================
// @route   POST /api/auth/logout
// @desc    Logout user (invalidate refresh token)
// =======================================================
router.post("/logout", (req, res) => {
  const { refreshToken } = req.body;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  res.json({ message: "Logged out successfully" });
});

export default router;
