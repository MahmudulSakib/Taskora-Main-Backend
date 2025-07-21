import express from "express";
import { db } from "../db";
import { jobPostRequestsTable, usersTable, jobProofsTable } from "../db/schema";
import { eq, desc, and } from "drizzle-orm";
import multer from "multer";
import cloudinary from "../cloudinary";
import passport from "../security/passportconfig";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const clientmicrojob = express.Router();

clientmicrojob.get(
  "/api/accepted-jobs",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const jobs = await db
        .select({
          id: jobPostRequestsTable.id,
          title: jobPostRequestsTable.title,
          link: jobPostRequestsTable.link,
          leftlimit: jobPostRequestsTable.leftLimit,
          costPerLimit: jobPostRequestsTable.costPerLimit,
          totalCost: jobPostRequestsTable.totalCost,
          imageUrl: jobPostRequestsTable.imageUrl,
          description: jobPostRequestsTable.description,
          status: jobPostRequestsTable.status,
          createdAt: jobPostRequestsTable.createdAt,
          user: {
            fullName: usersTable.fullName,
            email: usersTable.email,
          },
        })
        .from(jobPostRequestsTable)
        .leftJoin(usersTable, eq(jobPostRequestsTable.userId, usersTable.id))
        .where(eq(jobPostRequestsTable.status, "accepted"))
        .orderBy(desc(jobPostRequestsTable.createdAt));

      res.json(jobs);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch accepted jobs" });
    }
  }
);

clientmicrojob.get(
  "/api/accepted-jobs/:id",
  passport.authenticate("jwt", { session: false }),
  async (req: any, res: any) => {
    const { id } = req.params;
    try {
      const job = await db
        .select({
          id: jobPostRequestsTable.id,
          title: jobPostRequestsTable.title,
          link: jobPostRequestsTable.link,
          limit: jobPostRequestsTable.limit,
          costPerLimit: jobPostRequestsTable.costPerLimit,
          totalCost: jobPostRequestsTable.totalCost,
          imageUrl: jobPostRequestsTable.imageUrl,
          description: jobPostRequestsTable.description,
          status: jobPostRequestsTable.status,
          createdAt: jobPostRequestsTable.createdAt,
          user: {
            fullName: usersTable.fullName,
            email: usersTable.email,
          },
        })
        .from(jobPostRequestsTable)
        .leftJoin(usersTable, eq(jobPostRequestsTable.userId, usersTable.id))
        .where(eq(jobPostRequestsTable.id, id));

      if (job.length === 0) {
        return res.status(404).json({ error: "Job not found" });
      }

      res.json(job[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch job" });
    }
  }
);

clientmicrojob.get(
  "/api/jobs/:id/check-submission",
  passport.authenticate("jwt", { session: false }),
  async (req: any, res: any) => {
    const userId = req.user?.id;
    const jobId = req.params.id;

    if (!userId) return res.status(401).json({ submitted: false });

    const existing = await db
      .select()
      .from(jobProofsTable)
      .where(
        and(eq(jobProofsTable.userId, userId), eq(jobProofsTable.jobId, jobId))
      );

    res.json({ submitted: existing.length > 0 });
  }
);

clientmicrojob.post(
  "/api/jobs/:id/submit-proof",
  passport.authenticate("jwt", { session: false }),
  upload.array("images", 15),
  async (req: any, res: any) => {
    const userId = req.user?.id;
    const jobId = req.params.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const existing = await db
      .select()
      .from(jobProofsTable)
      .where(
        and(eq(jobProofsTable.userId, userId), eq(jobProofsTable.jobId, jobId))
      );

    if (existing.length > 0) {
      return res
        .status(400)
        .json({ error: "You have already submitted proof for this job." });
    }

    if (!req.files || req.files.length === 0)
      return res.status(400).json({ error: "No files uploaded" });

    try {
      const uploadedUrls: string[] = [];

      for (const file of req.files) {
        const url = await new Promise<string>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "job-proofs" },
            (error, result) => {
              if (error || !result) reject(error);
              else resolve(result.secure_url);
            }
          );
          stream.end(file.buffer);
        });

        uploadedUrls.push(url);
      }

      await db.insert(jobProofsTable).values({
        userId,
        jobId,
        imageUrls: uploadedUrls,
      });

      res.json({ message: "Proof uploaded successfully." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to upload proof." });
    }
  }
);

export default clientmicrojob;
