// models/Audio.ts
import mongoose, { Schema, Document, Model } from "mongoose";

interface IAudio extends Document {
  title: string;
  url: string;
  uploadedBy: mongoose.Types.ObjectId; // user who uploaded or created it
  duration: number; // in seconds
  createdAt: Date;
}

const AudioSchema: Schema<IAudio> = new Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  duration: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const AudioModel: Model<IAudio> = mongoose.model<IAudio>("Audio", AudioSchema);
export default AudioModel;