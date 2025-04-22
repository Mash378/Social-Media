import bcrypt from "bcrypt";
import cors from "cors";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import session from "express-session";
import mongoose from "mongoose";
import UserModel from "./models/User";
const store = new session.MemoryStore();

dotenv.config();

const app: Express = express();
app.use(express.json());
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

const mongoUri: string | undefined = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error("MONGODB_URI is not defined in environment variables.");
}

mongoose
  .connect(mongoUri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Extend the session interface to include the 'user' property
declare module "express-session" {
  interface SessionData {
    user?: {
      id: string;
      username: string;
      email: string;
    };
  }
  interface Session {
    user?: {
      id: string;
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

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: () => void
) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
};

app.get("/home", isAuthenticated, (req, res) => {
  res.send("Hello, " + req.session?.user?.username + "!");
});

app.post("/login", async (req: Request, res: Response) => {
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

    req.session.user = {
      id: user.id.toString(),
      username: user.username,
      email: user.email,
    };
    req.session.save((err) => {
      if (err) {
        console.error("Error saving session:", err);
        res.status(500).json({ error: "Failed to save session." });
      } else {
        res.json({
          message: "Success!",
          user: { username: user.username, email: user.email },
        });
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

    const existingUser = await UserModel.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      res
        .status(409)
        .json({ error: "User with this username or email already exists." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserModel.create({
      username,
      email,
      password: hashedPassword,
    });

    req.session.user = {
      id: newUser.id.toString(),
      username: newUser.username,
      email: newUser.email,
    };
    req.session.save((err) => {
      if (err) {
        console.error("Error saving session:", err);
        res.status(500).json({ error: "Failed to save session" });
      } else {
        res.status(201).json({
          message: "User created successfully",
          user: { username: newUser.username, email: newUser.email },
        });
      }
    });
  } catch (err) {
    console.error("Signup error:", err);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
});

// POST route to handle logout action (from frontend)
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session", err);
      return res.status(500).send("Could not log out.");
    }

    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully." });
  });
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
