import express from "express";
import passport from "../security/passportconfig";

const clientLogout = express.Router();

clientLogout.post(
  "/client/log-out",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.clearCookie("clienttoken");
    res.status(200).json({ message: "Logged out successfully" });
  }
);

export default clientLogout;
