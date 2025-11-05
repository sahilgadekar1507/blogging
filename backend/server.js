import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Loads .env
dotenv.config();

// Connect DB
connectDB();

// Init App
const app = express();  

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send("Hello. JI");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`server on port ${PORT || 500}`);
});