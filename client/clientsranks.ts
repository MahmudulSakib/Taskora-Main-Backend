import express from "express";
import { db } from "../db";
import { usersTable, userRanksTable } from "../db/schema";
import { eq } from "drizzle-orm";
import passport from "../security/passportconfig";

const clientranks = express.Router();

clientranks.get(
  "/client/user-ranks",
  passport.authenticate("jwt", { session: false }),
  async (req: any, res: any) => {
    try {
      const users = await db
        .select({
          id: usersTable.id,
          fullName: usersTable.fullName,
          email: usersTable.email,
          rank: userRanksTable.rank,
        })
        .from(userRanksTable)
        .leftJoin(usersTable, eq(userRanksTable.userId, usersTable.id))
        .orderBy(userRanksTable.rank);

      res.json(users);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch user ranks" });
    }
  }
);

export default clientranks;
