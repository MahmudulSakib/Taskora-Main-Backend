import express from "express";
import passport from "../security/passportconfig";
import bcrypt from "bcrypt";
import { db } from "../db";
import { eq } from "drizzle-orm";
import {
  bonusWithdrawRequestsTable,
  userBonusWalletTable,
  usersTable,
} from "../db/schema";

const bonusWithdraw = express.Router();

bonusWithdraw.post(
  "/client/request-bonus-withdraw",
  passport.authenticate("jwt", { session: false }),
  async (req: any, res: any) => {
    const userId = req.user.id;
    const {
      amount,
      method,
      mobileNumber,
      mobileBankType,
      accountNumber,
      branchName,
      accountName,
      bankName,
      password,
    } = req.body;

    if (!amount || !method || !password)
      return res.status(400).json({ error: "Missing required fields" });

    const amt = parseFloat(amount);
    if (amt < 250)
      return res.status(400).json({ error: "Minimum 250 TK required" });

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (!user) return res.status(404).json({ error: "User not found" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(400).json({ error: "Invalid password" });

    const [wallet] = await db
      .select()
      .from(userBonusWalletTable)
      .where(eq(userBonusWalletTable.userId, userId));

    if (!wallet || parseFloat(wallet.amount ?? "0") < amt) {
      return res.status(400).json({ error: "Insufficient bonus balance" });
    }

    if (method === "mobile_banking") {
      if (!mobileNumber || !mobileBankType)
        return res
          .status(400)
          .json({ error: "Mobile number and type are required" });
    } else if (method === "banking") {
      if (!accountNumber || !branchName || !accountName || !bankName)
        return res.status(400).json({ error: "All bank fields are required" });
    }

    await db
      .update(userBonusWalletTable)
      .set({
        amount: `${parseFloat(wallet.amount ?? "0") - amt}`,
      })
      .where(eq(userBonusWalletTable.userId, userId));

    await db.insert(bonusWithdrawRequestsTable).values({
      userId,
      amount: `${amt}`,
      method,
      mobileBankType: method === "mobile_banking" ? mobileBankType : null,
      mobileNumber: method === "mobile_banking" ? mobileNumber : null,
      accountNumber: method === "banking" ? accountNumber : null,
      branchName: method === "banking" ? branchName : null,
      accountName: method === "banking" ? accountName : null,
      bankName: method === "banking" ? bankName : null,
      status: "pending",
    });

    res.json({ message: "Withdraw request submitted!" });
  }
);

export default bonusWithdraw;
