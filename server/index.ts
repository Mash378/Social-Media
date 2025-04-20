import express, { Express, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import UserModel from "./models/User";
import session, { SessionData } from "express-session";
import { MongoClient } from "mongodb";
import VideoModel, { IVideo } from "./models/Video";
import BattleModel from "./models/Battle";
import { Types } from 'mongoose'; // Import the Types module

const store = new session.MemoryStore();

dotenv.config();

const app: Express = express();
app.use(express.json());
app.use(cors({
  origin: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));

const mongoUri: string | undefined = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error("MONGODB_URI is not defined in environment variables.");
}

mongoose
  .connect(mongoUri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));


const usersDb = mongoose.connection.useDb('users_db');
const UserDbModel = usersDb.model("User", UserModel.schema);

// Extend the session interface to include the 'user' property
declare module 'express-session' {
  interface SessionData {
    user?: {
      username: string;
      email: string;
    };
  }
  interface Session {
    user?: {
      username: string;
      email: string;
    };
  }
}

app.use(
  session({
    secret: "some-secret",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: false,
    },
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.user) {
    next(); // Call next without arguments for success
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
};

app.get('/home', isAuthenticated, (req, res) => {
  res.send("Hello, " + req.session?.user?.username + "!");
});

app.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await UserDbModel.findOne({ username });

    if (!user) {
      res.status(400).json({ error: "No record existed. Please check the username you entered and try again." });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Password is incorrect." });
      return;
    }

    req.session.user = {
      username: user.username,
      email: user.email,
    };
    req.session.save((err) => {
      if (err) {
        console.error("Error saving session:", err);
        res.status(500).json({ error: "Failed to save session." });
      } else {
        res.json({ message: "Success!", user: { username: user.username, email: user.email } });
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Error logging in." });
  }
});

app.post("/signup", async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await UserDbModel.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      res
        .status(409)
        .json({ error: "User with this username or email already exists." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserDbModel.create({
      username,
      email,
      password: hashedPassword,
    });

    req.session.user = {
      username: newUser.username,
      email: newUser.email,
    };
    req.session.save((err) => {
      if (err) {
        console.error("Error saving session:", err);
        res.status(500).json({ error: "Failed to save session" });
      } else {
        res.status(201).json({ message: "User created successfully", user: { username: newUser.username, email: newUser.email } });
      }
    });
  } catch (err) {
    console.error("Signup error:", err);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
});

app.post("/pairVideos", isAuthenticated, async (req: Request, res: Response): Promise<void> => {
  try {
    const { audioId, tag } = req.body;

    if (!audioId || !tag) {
      res.status(400).json({ error: "Audio ID and tag are required." });
      return;
    }

    // Find videos that share the same audioId and have the same tag
    const videos = await VideoModel.find({
      audioId,
      tags: tag,
      status: "active", // Ensure only active videos are considered
    }) as IVideo[];  // Assert the type of videos to be IVideo[]

    if (videos.length < 2) {
      res.status(404).json({ error: "Not enough videos for pairing." });
      return;
    }

    // Set the vote similarity margin (20% margin here)
    const voteMargin = 0.2;
    
    // Randomly select the first video for pairing
    const video1 = videos[Math.floor(Math.random() * videos.length)] as IVideo;  // Type assertion
    let video2: IVideo;

    // Filter videos by vote similarity
    const minVotes = video1.votes * (1 - voteMargin);
    const maxVotes = video1.votes * (1 + voteMargin);

    // Get the videos that are within the vote margin and are not the same as video1
    const fairCandidates = videos.filter(video =>
      video._id.toString() !== video1._id.toString() &&
      video.votes >= minVotes &&
      video.votes <= maxVotes
    );

    // If no fair candidates are found, return an error
    if (fairCandidates.length === 0) {
      res.status(404).json({ error: "No fair match found based on vote similarity." });
      return;
    }

    // Randomly select a fair video for pairing
    video2 = fairCandidates[Math.floor(Math.random() * fairCandidates.length)] as IVideo;  // Type assertion

    // Check if a battle with the same video pair already exists
    const existingBattle = await BattleModel.findOne({
      $or: [
        { video1: video1._id, video2: video2._id },
        { video1: video2._id, video2: video1._id }
      ],
      tag,
      active: true
    });

    if (existingBattle) {
      res.status(400).json({ error: "This video pair is already in battle." });
      return;
    }

    // Create the battle
    const newBattle = new BattleModel({
      video1: video1._id,
      video2: video2._id,
      tag,
      startedAt: new Date(),
      endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    });

    await newBattle.save();

    // Return the battle details
    res.status(201).json({
      message: "Battle created successfully.",
      battle: newBattle,
    });
  } catch (err) {
    console.error("Error pairing videos:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});


// POST route to handle logout action (from frontend)
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session", err);
      res.status(500).send("Could not log out.");
      return;
    }

    res.clearCookie('connect.sid');
    res.json({ message: "Logged out successfully." });
  });
});


app.listen(3001, () => {
  console.log("Server is running on port 3001");
});