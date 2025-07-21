import express from "express";
import passport from "../security/passportconfig";
import { db } from "../db";
import { walletTable } from "../db/schema";
import { eq } from "drizzle-orm";

const clientFund = express.Router();

clientFund.get(
  "/client/fund",
  passport.authenticate("jwt", { session: false }),
  async (req: any, res: any) => {
    try {
      const userId = req.user.id;

      const fundData = await db
        .select()
        .from(walletTable)
        .where(eq(walletTable.userId, userId));

      const wallet = fundData[0];

      const balance = wallet?.balance ? parseFloat(wallet.balance) : 0;

      return res.json({ balance });
    } catch (error) {
      console.error("Error fetching user fund:", error);
      return res.status(500).json({ error: "Failed to fetch fund" });
    }
  }
);

export default clientFund;
