import express from "express";
import { db } from "../db";
import { userBonusWalletTable } from "../db/schema";
import { eq } from "drizzle-orm";
import passport from "../security/passportconfig";

const clientbonusad = express.Router();

clientbonusad.post(
  "/api/bonus/ad-click",
  passport.authenticate("jwt", { session: false }),
  async (req: any, res: any) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const amountToAdd = 0.015;

    try {
      const existing = await db
        .select()
        .from(userBonusWalletTable)
        .where(eq(userBonusWalletTable.userId, userId));

      if (existing.length > 0) {
        const currentAmount = parseFloat(existing[0].amount ?? "0");
        const newAmount = (currentAmount + amountToAdd).toFixed(5);

        await db
          .update(userBonusWalletTable)
          .set({
            amount: newAmount,
            updatedAt: new Date(),
          })
          .where(eq(userBonusWalletTable.userId, userId));
      } else {
        await db.insert(userBonusWalletTable).values({
          userId,
          amount: amountToAdd.toFixed(5),
          updatedAt: new Date(),
        });
      }

      res.json({ message: "Bonus added successfully" });
    } catch (err) {
      console.error("Failed to add bonus:", err);
      res.status(500).json({ error: "Failed to add bonus" });
    }
  }
);

export default clientbonusad;
