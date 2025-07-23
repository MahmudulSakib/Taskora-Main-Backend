import express from "express";
import passport from "../security/passportconfig";
import { db } from "../db";
import { notificationsTable } from "../db/schema";
import { eq, desc } from "drizzle-orm";

const clientNotification = express.Router();

clientNotification.get(
  "/client/notifications",
  passport.authenticate("jwt", { session: false }),
  async (req: any, res: any) => {
    try {
      const data = await db
        .select()
        .from(notificationsTable)
        .orderBy(desc(notificationsTable.createdAt));
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  }
);

export default clientNotification;
