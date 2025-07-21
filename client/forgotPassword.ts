import { db } from "../db";
import { passwordResetTokens } from "../db/schema";
import { nanoid } from "nanoid";
import nodemailer from "nodemailer";
import express from "express";

const clientfogotPassword = express.Router();

clientfogotPassword.post(
  "/client/forgot-password",
  async (req: any, res: any) => {
    const { email } = req.body;

    const user = await db.query.usersTable.findFirst({
      where: (u, { eq }) => eq(u.email, email),
    });

    if (!user) {
      return res.json({ message: "Your email is not registered." });
    }
    const token = nanoid(32);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    await db.insert(passwordResetTokens).values({
      email,
      token,
      expiresAt,
    });

    const resetLink = `http://localhost:3001/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      to: email,
      subject: "Reset Your Password",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    });

    res.json({
      message: "Password reset link has been sent to your email.",
    });
  }
);

export default clientfogotPassword;
