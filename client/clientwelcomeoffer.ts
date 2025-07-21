// routes/clientWelcomeOffer.ts
import express from "express";
import { db } from "../db";
import { usersTable, userBonusWalletTable } from "../db/schema";
import { eq } from "drizzle-orm";
import passport from "../security/passportconfig";

const clientwelcomeoffer = express.Router();

clientwelcomeoffer.post(
  "/client/claim-welcome-offer",
  passport.authenticate("jwt", { session: false }),
  async (req: any, res: any) => {
    const userId = req.user.id;

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (!user || user.hasClaimedWelcomeOffer) {
      return res.status(400).json({ error: "Already claimed" });
    }

    try {
      await db.transaction(async (tx) => {
        await tx
          .update(usersTable)
          .set({ hasClaimedWelcomeOffer: true })
          .where(eq(usersTable.id, userId));

        const existing = await tx
          .select()
          .from(userBonusWalletTable)
          .where(eq(userBonusWalletTable.userId, userId));

        if (existing.length > 0) {
          await tx
            .update(userBonusWalletTable)
            .set({
              amount: (parseFloat(existing[0].amount ?? "0") + 100).toString(),
            })
            .where(eq(userBonusWalletTable.userId, userId));
        } else {
          await tx.insert(userBonusWalletTable).values({
            userId,
            amount: "100",
          });
        }
      });

      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Something went wrong" });
    }
  }
);

clientwelcomeoffer.get(
  "/client/welcome-offer-status",
  passport.authenticate("jwt", { session: false }),
  async (req: any, res) => {
    const userId = req.user.id;

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));
    res.json({ claimed: !!user?.hasClaimedWelcomeOffer });
  }
);

export default clientwelcomeoffer;
