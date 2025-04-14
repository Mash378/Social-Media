import express from "express";
import { isAuthenticated } from "../index";  // assume it's exported for reuse
import Battle from "../models/Battle";
import Video from "../models/Video";

const battleRouter = express.Router();

// Create a new battle (24-hour contest between two videos)
battleRouter.post("/", isAuthenticated, async (req, res) => {
  try {
    const { video1Id, video2Id, tag } = req.body;
    // Ensure the IDs are valid ObjectIds and fetch videos
    const video1 = await Video.findById(video1Id);
    const video2 = await Video.findById(video2Id);
    if (!video1 || !video2) {
      res.status(404).json({ error: "One or both videos not found" });
      return;
    }
    // verify both videos share the given tag
    if (tag) {
      const v1HasTag = video1.tags.includes(tag);
      const v2HasTag = video2.tags.includes(tag);
      if (!v1HasTag || !v2HasTag) {
        res.status(400).json({ error: "Videos do not share the tag provided" });
        return;
      }
    }
    const battleTag = tag || (video1.tags.find(t => video2.tags.includes(t))); 
    if (!battleTag) {
      res.status(400).json({ error: "No common tag found for these videos" });
      return;
    }

    // Create and save the new battle
    const newBattle = await Battle.create({ 
      video1: video1._id, 
      video2: video2._id, 
      tag: battleTag 
    });
    res.status(201).json(newBattle);
    return;
  } catch (err) {
    console.error("Error creating battle:", err);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
});
