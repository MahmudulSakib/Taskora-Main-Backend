import express from "express";
import passport from "../security/passportconfig";

const clientLogout = express.Router();

clientLogout.post("/client/log-out", (req, res) => {
  res.clearCookie("clienttoken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.status(200).json({ message: "Logged out successfully" });
});

export default clientLogout;
