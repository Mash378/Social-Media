import mongoose, { Document, Model, Schema } from "mongoose";

// Ensure you export the interface
export interface IVideo extends Document {
  _id: mongoose.Types.ObjectId;
  uploaderId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  url: string;
  tags: string[];
  audioId: Schema.Types.ObjectId;
  uploadedAt: Date;
  views: number;
  votes: number;
  status: "active" | "deleted";
}

const VideoSchema: Schema<IVideo> = new Schema({
  uploaderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  url: { type: String, required: true },
  tags: { type: [String], default: [] },
  audioId: { type: Schema.Types.ObjectId, ref: "Audio", required: true },
  uploadedAt: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
  votes: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "deleted"], default: "active" },
});

const VideoModel: Model<IVideo> = mongoose.model<IVideo>("Video", VideoSchema);
export default VideoModel;