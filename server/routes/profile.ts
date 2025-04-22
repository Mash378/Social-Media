import { Router } from "express";
import mongoose from "mongoose";
import { isAuthenticated } from "../middleware/auth";
import Video from "../models/Video";
import Vote from "../models/Vote";

const router = Router();

router.get("/", isAuthenticated, async (req, res) => {
  const user = req.session.user!;
  const videos = await Video.find({ uploaderId: user.id }).sort({
    uploadedAt: -1,
  });

  const userObjId = new mongoose.Types.ObjectId(user.id);

  const votes = await Vote.aggregate([
    { $match: { voterId: userObjId } },
    {
      $lookup: {
        from: "battles",
        localField: "battleId",
        foreignField: "_id",
        as: "battle",
      },
    },
    { $unwind: "$battle" },
    {
      $lookup: {
        from: "videos",
        localField: "votedFor",
        foreignField: "_id",
        as: "video",
      },
    },
    { $unwind: "$video" },
    {
      $addFields: {
        endsInMs: {
          $subtract: [{ $toLong: "$battle.endsAt" }, { $toLong: "$$NOW" }],
        },
      },
    },
    {
      $project: {
        battleId: 1,
        tag: "$battle.tag",
        videoTitle: "$video.title",
        endsInMs: 1,
      },
    },
    { $sort: { votedAt: -1 } },
  ]);

  res.json({ username: user.username, videos, votes });
});

export default router;
