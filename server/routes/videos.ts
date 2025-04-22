// routes/videos.ts
import { Upload } from "@aws-sdk/lib-storage";
import { Request, Response, Router } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import BattleModel from "../models/Battle";
import VideoModel from "../models/Video";
import { s3 } from "../s3";

const router = Router();

const uploadDir = path.resolve(__dirname, "../uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) =>
    cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage: multer.memoryStorage() });

type MulterRequest = Request & { file?: Express.Multer.File };

const parseTags = (raw: unknown): string[] => {
  if (Array.isArray(raw)) return raw as string[];
  try {
    const parsed = JSON.parse(String(raw));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

router.post("/upload", upload.single("video"), async (req, res) => {
  try {
    const { title = "", description = "", tags = "[]" } = req.body;
    const uploaderId = req.session.user!.id;
    const tagArr = JSON.parse(tags);

    // upload to S3
    const key = `videos/${Date.now()}_${req.file!.originalname}`;

    await new Upload({
      client: s3,
      params: {
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        Body: req.file!.buffer,
        ContentType: req.file!.mimetype,
      },
    }).done();

    const url = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    const videoDoc = await VideoModel.create({
      uploaderId,
      title,
      description,
      tags: tagArr,
      url, // public S3 URL
      s3Key: key, // store for future deletes
    });

    (async () => {
      // 1. find any ACTIVE video (status: 'active') that shares a tag
      const match = await VideoModel.findOne({
        _id: { $ne: videoDoc._id },
        tags: { $in: videoDoc.tags },
        status: "active",
      }).sort({ uploadedAt: -1 });

      if (!match) return; // nothing to battle with yet

      // 2. shared tag (pick first overlap)
      const sharedTag = match.tags.find((t) => videoDoc.tags.includes(t));

      // 3. guard: no duplicate active battle between same pair
      const existing = await BattleModel.findOne({
        active: true,
        tag: sharedTag,
        $or: [
          { video1: match._id, video2: videoDoc._id },
          { video1: videoDoc._id, video2: match._id },
        ],
      });

      if (existing) return; // battle already exists

      // 4. create battle
      const battle = await BattleModel.create({
        video1: match._id,
        video2: videoDoc._id,
        tag: sharedTag,
        active: true,
        createdAt: new Date(),
      });

      // 5. mark both videos as 'battling'
      await VideoModel.updateMany(
        { _id: { $in: [match._id, videoDoc._id] } },
        { $set: { status: "battling" } }
      );
    })();

    res.status(201).json(videoDoc);
  } catch (err) {
    console.error("Upload error", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

router.get("/my-videos", async (req: Request, res: Response): Promise<any> => {
  if (!req.session?.user)
    return res.status(401).json({ error: "Unauthenticated" });

  const vids = await VideoModel.find({ uploaderId: req.session.user.id }).sort({
    uploadedAt: -1,
  });

  return res.json(vids);
});

export default router;
