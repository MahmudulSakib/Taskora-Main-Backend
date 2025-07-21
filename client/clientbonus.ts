import express from "express";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { userBonusWalletTable } from "../db/schema";
import passport from "../security/passportconfig";

const clientbonus = express.Router();

clientbonus.get(
  "/client/bonus-wallet",
  passport.authenticate("jwt", { session: false }),
  async (req: any, res: any) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
      const [wallet] = await db
        .select()
        .from(userBonusWalletTable)
        .where(eq(userBonusWalletTable.userId, userId));
      res.json(wallet || { amount: "0", updatedAt: new Date() });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch wallet" });
    }
  }
);

export default clientbonus;
