import mongoose, { Document, Model, Schema } from "mongoose";

// Ensure you export the interface
export interface IVideo extends Document {
  _id: mongoose.Types.ObjectId;
  uploaderId: String;
  title: string;
  url: string;
  tags: string[];
  uploadedAt: Date;
  votes: number;
  status: "active" | "deleted";
}

const VideoSchema: Schema<IVideo> = new Schema({
  uploaderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  tags: { type: [String], default: [] },
  uploadedAt: { type: Date, default: Date.now },
  votes: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "deleted"], default: "active" },
});

const VideoModel: Model<IVideo> = mongoose.model<IVideo>("Video", VideoSchema);
export default VideoModel;