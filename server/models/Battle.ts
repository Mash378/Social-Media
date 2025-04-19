import mongoose, { Document, Model, Schema } from "mongoose";

interface IBattle extends Document {
  video1: mongoose.Types.ObjectId;
  video2: mongoose.Types.ObjectId;
  tag: string;
  startedAt: Date;
  endsAt: Date;
  active: boolean;
  video1Votes: number;
  video2Votes: number;
  winner?: mongoose.Types.ObjectId; // the winning Video's ID (or undefined if tie or not concluded)
  concludedAt?: Date;
}

// Battle.ts
const BattleSchema: Schema<IBattle> = new Schema({
  video1: { type: Schema.Types.ObjectId, ref: "Video", required: true },
  video2: { type: Schema.Types.ObjectId, ref: "Video", required: true },
  tag: { type: String, required: true }, // tag on which this battle is based
  startedAt: { type: Date, default: Date.now },
  endsAt: {
    type: Date,
    default: function () {
      return Date.now() + 24 * 60 * 60 * 1000;
    },
  }, // 24 hours from start
  active: { type: Boolean, default: true }, // true if battle is ongoing (not yet resolved)
  // Fields to store outcome after resolution:
  video1Votes: { type: Number, default: 0 },
  video2Votes: { type: Number, default: 0 },
  winner: { type: Schema.Types.ObjectId, ref: "Video" }, // set when battle concludes
  concludedAt: { type: Date },
});

// Ensure combination of video1, video2, and tag is unique for active battles
BattleSchema.index({ video1: 1, video2: 1, tag: 1, active: 1 }, { unique: true });

const BattleModel: Model<IBattle> = mongoose.model<IBattle>("Battle", BattleSchema);
export default BattleModel;
