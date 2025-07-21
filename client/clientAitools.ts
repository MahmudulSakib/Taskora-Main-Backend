import express from "express";
import { db } from "../db";
import {
  aiSubscriptionsTable,
  usersTable,
  userAiSubscriptionsTable,
  walletTable,
} from "../db/schema";
import { desc, eq } from "drizzle-orm";
import passport from "../security/passportconfig";
import bcrypt from "bcrypt";

const clientaisubs = express.Router();

clientaisubs.get(
  "/client/available-ai-subscriptions",
  passport.authenticate("jwt", { session: false }),
  async (req: any, res: any) => {
    try {
      const plans = await db
        .select()
        .from(aiSubscriptionsTable)
        .orderBy(desc(aiSubscriptionsTable.createdAt));
      res.json(plans);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch available plans" });
    }
  }
);

clientaisubs.post(
  "/client/buy-ai-subscription",
  passport.authenticate("jwt", { session: false }),
  async (req: any, res: any) => {
    const { planId, email, mobileNumber, password } = req.body;
    const userId = req.user?.id;

    if (!userId || !planId || !email || !mobileNumber || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    try {
      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, userId));

      if (!user) return res.status(404).json({ error: "User not found" });

      const [plan] = await db
        .select()
        .from(aiSubscriptionsTable)
        .where(eq(aiSubscriptionsTable.id, planId));

      if (!plan) return res.status(404).json({ error: "Plan not found" });

      const [wallet] = await db
        .select()
        .from(walletTable)
        .where(eq(walletTable.userId, userId));

      const walletBalance = Number(wallet?.balance ?? 0);
      const price = Number(plan.price);

      if (walletBalance <= 0) {
        return res.json({
          needFund: true,
          message: "Wallet balance is 0. Please add fund.",
        });
      }

      if (walletBalance < price) {
        return res.json({
          needFund: true,
          message: "Insufficient balance. Please add fund.",
        });
      }

      const isMatch =
        user.email === email &&
        user.mobileNumber === mobileNumber &&
        (await bcrypt.compare(password, user.password));

      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const newBalance = walletBalance - price;
      await db
        .update(walletTable)
        .set({ balance: `${newBalance}` })
        .where(eq(walletTable.userId, userId));

      await db.insert(userAiSubscriptionsTable).values({
        userId,
        planId,
        email,
        mobileNumber,
      });

      return res.json({ success: true });
    } catch (err) {
      console.error("Buy AI Subscription Error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default clientaisubs;
