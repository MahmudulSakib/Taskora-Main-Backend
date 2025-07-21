import express from "express";
import { db } from "../db";
import { addMoneyRequestsTable, usersTable } from "../db/schema";
import passport from "../security/passportconfig";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

const clientAddmoney = express.Router();

clientAddmoney.post(
  "/client/add-money-request",
  passport.authenticate("jwt", { session: false }),
  async (req: any, res: any) => {
    const { paymentMethod, merchantNumber, senderNumber, amount, password } =
      req.body;
    const userId = req.user.id;

    if (
      !paymentMethod ||
      !merchantNumber ||
      !senderNumber ||
      !amount ||
      !password
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    try {
      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, userId));

      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ error: "Password incorrect." });
      }

      await db.insert(addMoneyRequestsTable).values({
        userId,
        paymentMethod,
        merchantNumber,
        senderNumber,
        amount: amount.toString(),
        status: "pending",
      });

      return res.status(200).json({
        message: "Add money request submitted successfully.",
      });
    } catch (err) {
      console.error("Error submitting add money request:", err);
      return res
        .status(500)
        .json({ error: "Server error. Please try again later." });
    }
  }
);

export default clientAddmoney;
