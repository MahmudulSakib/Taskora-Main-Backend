import express from "express";
import multer from "multer";
import cloudinary from "../cloudinary";
import { db } from "../db";
import { usersTable } from "../db/schema";
import { eq } from "drizzle-orm";
import passport from "../security/passportconfig";

const upload = multer({ storage: multer.memoryStorage() });
const clientInfo = express.Router();

clientInfo.post(
  "/client/update-profile",
  passport.authenticate("jwt", { session: false }),
  upload.single("profileImage"),
  async (req: any, res: any) => {
    const { id, fullName, mobileNumber, email, gender, address, country } =
      req.body;

    let profileImageUrl;

    if (req.file) {
      const uploadRes = await cloudinary.uploader.upload_stream(
        { folder: "lifegood_users_profilepic" },
        async (error, result) => {
          if (error)
            return res.status(500).json({ error: "Image upload failed" });
          profileImageUrl = result?.secure_url;

          await db
            .update(usersTable)
            .set({
              fullName,
              mobileNumber,
              email,
              gender,
              address,
              country,
              profilePicture: profileImageUrl,
            })
            .where(eq(usersTable.id, id));

          return res
            .status(200)
            .json({ message: "Profile updated successfully" });
        }
      );
      uploadRes.end(req.file.buffer);
    } else {
      await db
        .update(usersTable)
        .set({
          fullName,
          mobileNumber,
          email,
          gender,
          address,
          country,
        })
        .where(eq(usersTable.id, id));

      return res.status(200).json({ message: "Profile updated successfully" });
    }
  }
);

export default clientInfo;
