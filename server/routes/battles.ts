// server/routes/battles.ts
import { Router } from "express";
import mongoose from "mongoose";
import { isAuthenticated } from "../middleware/auth";
import BattleModel from "../models/Battle";
import VideoModel from "../models/Video";

const battleRouter = Router();

const toObjectId = (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new Error(`Invalid ObjectId: ${id}`);
  return new mongoose.Types.ObjectId(id);
};

battleRouter.post("/", isAuthenticated, async (req, res) => {
  try {
    const { video1Id, video2Id, tag } = req.body;

    const video1 = await VideoModel.findById(video1Id);
    const video2 = await VideoModel.findById(video2Id);
    if (!video1 || !video2) {
      res.status(404).json({ error: "One or both videos not found" });
      return;
    }

    // Ensure a shared tag
    const sharedTag = tag || video1.tags.find((t) => video2.tags.includes(t));
    if (!sharedTag) {
      res.status(400).json({ error: "Videos do not share a common tag" });
      return;
    }

    const battle = await BattleModel.create({
      video1: video1._id,
      video2: video2._id,
      tag: sharedTag,
      active: true,
      createdAt: new Date(),
    });

    res.status(201).json(battle);
    return;
  } catch (err) {
    console.error("Error creating battle:", err);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
});

battleRouter.get("/active", async (_req, res) => {
  try {
    const battles = await BattleModel.aggregate([
      { $match: { active: true } },
      {
        $lookup: {
          from: "videos",
          localField: "video1",
          foreignField: "_id",
          as: "video1",
        },
      },
      { $unwind: "$video1" },
      {
        $lookup: {
          from: "videos",
          localField: "video2",
          foreignField: "_id",
          as: "video2",
        },
      },
      { $unwind: "$video2" },
      {
        $addFields: {
          endsInMs: {
            $subtract: [{ $toLong: "$endsAt" }, { $toLong: "$$NOW" }],
          },
        },
      },
      {
        $project: {
          tag: 1,
          video1: { title: "$video1.title", _id: "$video1._id" },
          video2: { title: "$video2.title", _id: "$video2._id" },
          endsInMs: 1,
          startedAt: 1,
          endsAt: 1,
        },
      },
      { $sort: { startedAt: -1 } },
    ]);
    res.json(battles);
  } catch (err) {
    console.error("Failed to fetch active battles:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

battleRouter.get("/:id", async (req, res) => {
  try {
    const battle = await BattleModel.findById(req.params.id)
      .populate("video1", "title url") // include BOTH fields
      .populate("video2", "title url")
      .lean(); // sends plain JS objects (optional)

    if (!battle) res.status(404).json({ error: "Battle not found" });
    res.json(battle);
  } catch (err) {
    res.status(400).json({ error: "Invalid battle id" });
  }
});

export default battleRouter;
