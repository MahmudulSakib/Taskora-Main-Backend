import express from "express";
import { db } from "../db";
import { driveOffersTable } from "../db/schema";
import { sql, desc } from "drizzle-orm";

const clientDriveOffer = express.Router();

clientDriveOffer.get("/client/drive-offers", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const [offers, [{ count }]] = await Promise.all([
      db
        .select()
        .from(driveOffersTable)
        .orderBy(desc(driveOffersTable.createdAt))
        .limit(limit)
        .offset(offset),

      db.select({ count: sql<number>`count(*)` }).from(driveOffersTable),
    ]);

    res.json({ offers, total: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch drive offers." });
  }
});

export default clientDriveOffer;
