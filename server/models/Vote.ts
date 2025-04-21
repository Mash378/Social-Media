import mongoose, { Schema, Document, Model } from "mongoose";

interface IVote extends Document {
  battleId: mongoose.Types.ObjectId;
  voterId: mongoose.Types.ObjectId;
  votedFor: mongoose.Types.ObjectId;
  votedAgainst: mongoose.Types.ObjectId;
  votedAt: Date;
}

const VoteSchema: Schema<IVote> = new Schema({
  battleId:    { type: Schema.Types.ObjectId, ref: "Battle", required: true },
  voterId:     { type: Schema.Types.ObjectId, ref: "User", required: true },
  votedFor:    { type: Schema.Types.ObjectId, ref: "Video", required: true },
  votedAgainst:{ type: Schema.Types.ObjectId, ref: "Video", required: true },
  votedAt:     { type: Date, default: Date.now }
});

const VoteModel: Model<IVote> = mongoose.model<IVote>("Vote", VoteSchema);
export default VoteModel;
