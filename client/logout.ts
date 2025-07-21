import express from "express";

const clientLogout = express.Router();

clientLogout.post("/client/log-out", (req, res) => {
  res.clearCookie("clienttoken");
  res.status(200).json({ message: "Logged out successfully" });
});

export default clientLogout;
