import { db } from "../db";
import { passwordResetTokens, usersTable } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import express from "express";

const clientResetPassword = express.Router();

clientResetPassword.post(
  "/client/reset-password",
  async (req: any, res: any) => {
    const { token, newPassword } = req.body;
    const tokenRecord = await db.query.passwordResetTokens.findFirst({
      where: (t, { eq }) => eq(t.token, token),
    });
    if (!tokenRecord || new Date() > tokenRecord.expiresAt) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db
      .update(usersTable)
      .set({ password: hashedPassword })
      .where(eq(usersTable.email, tokenRecord.email));
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));
    res.json({ message: "Password has been reset successfully." });
  }
);

export default clientResetPassword;
