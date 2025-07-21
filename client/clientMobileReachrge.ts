import { db } from "../db";
import { usersTable, walletTable, rechargeTable } from "../db/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import express from "express";
import passport from "../security/passportconfig";

const clientMobileRecharge = express.Router();

clientMobileRecharge.post(
  "/client/recharge",
  passport.authenticate("jwt", { session: false }),
  async (req: any, res: any) => {
    const { mobileNumber, amount, operator, simType, password } = req.body;
    const userId = req.user.id;

    try {
      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, userId));
      if (!user) return res.status(404).json({ error: "User not found." });

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid)
        return res.status(400).json({ error: "Incorrect password." });

      const rechargeAmount = parseFloat(amount);

      const [wallet] = await db
        .select()
        .from(walletTable)
        .where(eq(walletTable.userId, userId));
      const currentBalance = parseFloat(wallet?.balance || "0");

      if (currentBalance === 0)
        return res
          .status(400)
          .json({ error: "Your wallet is empty. Please add funds." });
      if (rechargeAmount > currentBalance)
        return res
          .status(400)
          .json({ error: "Insufficient balance. Please add funds." });

      const newBalance = currentBalance - rechargeAmount;
      await db
        .update(walletTable)
        .set({ balance: newBalance.toFixed(2) })
        .where(eq(walletTable.userId, userId));

      await db.insert(rechargeTable).values({
        userId,
        mobileNumber,
        operator,
        simType,
        amount: rechargeAmount.toString(),
      });

      return res.json({
        message: "Recharge request submitted successfully",
        newBalance: newBalance.toFixed(2),
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Something went wrong." });
    }
  }
);

export default clientMobileRecharge;
