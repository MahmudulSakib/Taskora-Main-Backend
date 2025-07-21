import express from "express";
import { vendorShipTable } from "../db/schema";
import { db } from "../db";
import passport from "../security/passportconfig";

const vendorShipRoute = express.Router();

vendorShipRoute.post(
  "/client/vendor-ship",
  passport.authenticate("jwt", { session: false }),
  async (req: any, res: any) => {
    const { shopName, shopAddress, contactNumber, email } = req.body;
    const userId = req.user.id;

    if (!shopName || !shopAddress || !contactNumber || !email) {
      return res.status(400).json({ error: "All fields are required." });
    }

    try {
      await db.insert(vendorShipTable).values({
        userId,
        shopName,
        shopAddress,
        contactNumber,
        email,
        status: "pending",
      });

      return res.status(200).json({ message: "Request submitted." });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Submission failed." });
    }
  }
);

export default vendorShipRoute;
