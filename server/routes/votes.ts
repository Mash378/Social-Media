import express from "express";
import mongoose from "mongoose";
import { isAuthenticated } from "../middleware/auth";
import Battle from "../models/Battle";
import Video from "../models/Video";
import Vote from "../models/Vote";

const votesRouter = express.Router();

// Helper to safely convert string to ObjectId
function toObjectId(id: string) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  throw new Error(`Invalid ObjectId: ${id}`);
}

// Cast a vote for a battle
votesRouter.post("/vote", isAuthenticated, async (req, res) => {
  try {
    let { battleId, votedFor, votedAgainst } = req.body;
    // Ensure user is logged in and get their user ID from session
    const sessionUser = req.session.user;
    if (!sessionUser) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    // (Assuming we stored user ID in session at login:)
    const voterId = new mongoose.Types.ObjectId(sessionUser.id);
    // If user ID was not stored, we could look up by username/email:
    // const user = await UserModel.findOne({ username: sessionUser.username });
    // const voterId = user?._id;

    // Convert IDs from strings to ObjectId (for safety)
    battleId = toObjectId(battleId);
    votedFor = toObjectId(votedFor);
    votedAgainst = toObjectId(votedAgainst);

    // Check that the battle is active
    const battle = await Battle.findById(battleId);
    if (!battle || !battle.active) {
      res.status(400).json({ error: "Battle not found or not active" });
      return;
    }
    // Ensure the videos correspond to the battle's videos (to prevent voting for unrelated video)
    if (!(battle.video1.equals(votedFor) || battle.video2.equals(votedFor))) {
      res
        .status(400)
        .json({ error: "votedFor video is not part of this battle" });
      return;
    }
    if (
      !(
        battle.video1.equals(votedAgainst) || battle.video2.equals(votedAgainst)
      )
    ) {
      res
        .status(400)
        .json({ error: "votedAgainst video is not part of this battle" });
      return;
    }
    if (votedFor.equals(votedAgainst)) {
      res
        .status(400)
        .json({ error: "votedFor and votedAgainst cannot be the same video" });
      return;
    }

    // Check if this user already voted in the battle
    const existingVote = await Vote.findOne({ battleId, voterId });
    if (existingVote) {
      res.status(206).json({ error: "You have already voted in this battle" });
      return;
    }

    // Record the new vote
    const voteDoc = await Vote.create({
      battleId,
      voterId,
      votedFor,
      votedAgainst,
      votedAt: new Date(),
    });
    // Increment the vote count on the chosen video (to track popularity)
    await Video.findByIdAndUpdate(votedFor, { $inc: { votes: 1 } }).exec();

    res.status(201).json({ message: "Vote recorded", vote: voteDoc });
    console.log(
      `User ${voterId} voted for video ${votedFor} in battle ${battleId}`
    );
  } catch (err) {
    console.error("Error recording vote:", err);
    res.status(500).json({ error: "Failed to record vote" });
  }
});

export default votesRouter;
