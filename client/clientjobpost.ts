import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import { jobPostRequestsTable, walletTable, usersTable } from "../db/schema";
import { desc, eq } from "drizzle-orm";
import cloudinary from "../cloudinary";
import passport from "../security/passportconfig";
import bcrypt from "bcrypt";
import streamifier from "streamifier";

const clientJobPosts = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

clientJobPosts.post(
  "/client/job-post",
  passport.authenticate("jwt", { session: false }),
  upload.single("image"),
  async (req: any, res: any) => {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      const { title, link, limit, costPerLimit, description, password } =
        req.body;

      const numericLimit = Number(limit);
      const numericCost = Number(costPerLimit);
      const totalCost = numericLimit * numericCost * 3;

      const [userData] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, user.id));

      const [wallet] = await db
        .select()
        .from(walletTable)
        .where(eq(walletTable.userId, user.id));

      if (!wallet || !wallet.balance || Number(wallet.balance) === 0) {
        return res
          .status(400)
          .json({ error: "Your wallet is empty. Please add funds first." });
      }

      if (Number(wallet.balance) < totalCost) {
        return res
          .status(400)
          .json({ error: "Insufficient balance. Please add more funds." });
      }

      const isMatch = await bcrypt.compare(password, userData.password);
      if (!isMatch)
        return res.status(400).json({ error: "Incorrect password." });

      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "Image file is required." });
      }

      const uploadStream = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "image", folder: "job-posts" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          streamifier.createReadStream(file.buffer).pipe(stream);
        });

      const result = await uploadStream();

      if (!result || typeof result !== "object" || !("secure_url" in result)) {
        return res.status(500).json({ error: "Cloudinary upload failed." });
      }

      const imageUrl = (result as any).secure_url;

      await db.insert(jobPostRequestsTable).values({
        id: uuidv4(),
        userId: user.id,
        title,
        link,
        limit: numericLimit.toString(),
        leftLimit: numericLimit,
        costPerLimit: numericCost.toString(),
        totalCost: totalCost.toString(),
        description,
        imageUrl,
      });

      await db
        .update(walletTable)
        .set({ balance: (Number(wallet.balance) - totalCost).toString() })
        .where(eq(walletTable.userId, user.id));

      return res
        .status(200)
        .json({ message: "Job post submitted successfully!" });
    } catch (err) {
      console.error("Job post error:", err);
      return res.status(500).json({ error: "Failed to submit job post." });
    }
  }
);

clientJobPosts.get(
  "/client/my-jobs",
  passport.authenticate("jwt", { session: false }),
  async (req: any, res: any) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const jobs = await db
        .select()
        .from(jobPostRequestsTable)
        .orderBy(desc(jobPostRequestsTable.createdAt))
        .where(eq(jobPostRequestsTable.userId, userId));

      res.status(200).json(jobs);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch job posts." });
    }
  }
);

export default clientJobPosts;
