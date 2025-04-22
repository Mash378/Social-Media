import mongoose, { Document, Model, Schema } from "mongoose";

interface IVideo extends Document {
  uploaderId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  url: string;
  tags: string[];
  uploadedAt: Date;
  views: number;
  votes: number;
  status: "active" | "battling" | "deleted";
}

const VideoSchema: Schema<IVideo> = new Schema({
  uploaderId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // link to User who uploaded
  title: { type: String, required: true },
  description: { type: String, default: "" },
  url: { type: String, required: true },
  tags: { type: [String], default: [] }, // list of tags (keywords)
  uploadedAt: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
  votes: { type: Number, default: 0 }, // aggregate votes (e.g., total upvotes in battles)
  status: {
    type: String,
    enum: ["active", "battling", "deleted"],
    default: "active",
  },
});

const VideoModel: Model<IVideo> = mongoose.model<IVideo>("Video", VideoSchema);
export default VideoModel;
