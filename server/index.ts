import express, { Express, Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import UserModel from "./models/User";

/*

    Status codes
    201: New user created
    400: No record existed or user already exists in database
    401: Password is incorrect
    500: Error logging in

*/

dotenv.config();

const app: Express = express();
app.use(express.json());
app.use(cors());

const router = express.Router()

const mongoUri: string | undefined = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error("MONGODB_URI is not defined in environment variables.");
}

// Connect to MongoDB
mongoose
  .connect(mongoUri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));


router.post("/login", async (req: Request, res: Response) => {
try {
    const { username, password } = req.body;
    const user = await UserModel.findOne({ username });

    if (!user) {
        res.status(400).json({ error: "No record existed." });
        return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        res.status(401).json({ error: "Password is incorrect." });
        return;
    }

    res.json({ message: "Success!" });
} catch (err) {
    res.status(500).json({ error: "Error logging in." });
}
});  

app.post("/signup", async (req: Request, res: Response) => {
try {
    const { username, email, password } = req.body;

    const existingUser = await UserModel.findOne({
        $or: [{ username }, { email }]
    })

    if (existingUser) {
        res.status(409).json({ error: "User with this username or email already exists." });
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserModel.create({ username, email, password: hashedPassword });

    res.status(201).json(newUser);
} catch (err) {
    res.status(500).json({ message: "Internal server error. Please try again later." });
}
});
  
app.listen(3001, () => {
  console.log("Server is running");
});