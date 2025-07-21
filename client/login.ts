import passport from "../security/passportconfig";
import { db } from "../db";
import { usersTable } from "../db/schema";
import { eq } from "drizzle-orm";
import express from "express";
import jwt from "jsonwebtoken";

const clientLogin = express.Router();

clientLogin.post("/client/log-in", (req: any, res: any, next: any) => {
  passport.authenticate(
    "local",
    { session: false },
    (err: any, user: any, info: any) => {
      if (err) return res.status(500).json({ error: "Server error" });
      if (!user)
        return res
          .status(400)
          .json({ error: info?.message || "Invalid credentials" });

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return res.status(500).json({ error: "JWT secret missing" });
      }

      const token = jwt.sign({ id: user.id }, jwtSecret, {
        expiresIn: "6h",
      });

      res.cookie("clienttoken", token, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 6 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        message: "Login successful",
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          mobileNumber: user.mobileNumber,
        },
      });
    }
  )(req, res, next);
});

clientLogin.get(
  "/protected",
  passport.authenticate("jwt", { session: false }),
  async (req: any, res: any) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    res.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        profilePicture: user.profilePicture || null,
      },
    });
  }
);

clientLogin.get(
  "/client/profile",
  passport.authenticate("jwt", { session: false }),
  async (req: any, res: any) => {
    try {
      const userId = req.user.id;

      const userData = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, userId));

      const user = userData[0];
      if (!user) return res.status(404).json({ error: "User not found" });

      return res.json({ user });
    } catch (error) {
      console.error("Profile fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch profile" });
    }
  }
);

export default clientLogin;
