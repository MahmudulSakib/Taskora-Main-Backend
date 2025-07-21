// import express from "express";
// import bcrypt from "bcrypt";
// import { db } from "../db";
// import { usersTable, userBonusWalletTable } from "../db/schema";
// import { eq } from "drizzle-orm";
// import nodemailer from "nodemailer";
// import crypto from "crypto";

// const clientSignup = express.Router();

// const transporter = nodemailer.createTransport({
//   service: "Gmail",
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

// // clientSignup.post("/client/sign-up", async (req: any, res: any) => {
// //   try {
// //     const {
// //       fullName,
// //       mobileNumber,
// //       email,
// //       password,
// //       confirmPassword,
// //       referCode,
// //     } = req.body;

// //     if (!fullName || !mobileNumber || !email || !password || !confirmPassword) {
// //       return res
// //         .status(400)
// //         .json({ error: "All required fields are necessary." });
// //     }

// //     if (password !== confirmPassword) {
// //       return res.status(400).json({ error: "Passwords do not match." });
// //     }

// //     const existing = await db
// //       .select()
// //       .from(usersTable)
// //       .where(eq(usersTable.email, email));
// //     if (existing.length > 0) {
// //       return res.status(400).json({ error: "Email already exists." });
// //     }

// //     const hashedPassword = await bcrypt.hash(password, 10);
// //     const token = crypto.randomBytes(32).toString("hex");

// //     const newUser = await db
// //       .insert(usersTable)
// //       .values({
// //         fullName,
// //         mobileNumber,
// //         email,
// //         password: hashedPassword,
// //         referCode: referCode || null,
// //         verificationToken: token,
// //       })
// //       .returning();

// //     const verifyUrl = `http://localhost:3001/verify?token=${token}`;

// //     await transporter.sendMail({
// //       from: `"Life Good" <${process.env.SMTP_USER}>`,
// //       to: email,
// //       subject: "Verify Your Email",
// //       html: `<p>Click the link below to verify your email:</p>
// //              <a href="${verifyUrl}">${verifyUrl}</a>`,
// //     });

// //     return res
// //       .status(201)
// //       .json({ message: "Verification email sent. Please check your inbox." });
// //   } catch (error) {
// //     console.error("Sign-up error:", error);
// //     return res.status(500).json({ error: "Internal Server Error" });
// //   }
// // });

// const generateReferralCode = () => crypto.randomBytes(4).toString("hex"); // 8-character

// clientSignup.post("/client/sign-up", async (req: any, res: any) => {
//   try {
//     const {
//       fullName,
//       mobileNumber,
//       email,
//       password,
//       confirmPassword,
//       referCode, // this is the code they used from someone else
//     } = req.body;

//     if (!fullName || !mobileNumber || !email || !password || !confirmPassword) {
//       return res
//         .status(400)
//         .json({ error: "All required fields are necessary." });
//     }

//     if (password !== confirmPassword) {
//       return res.status(400).json({ error: "Passwords do not match." });
//     }

//     const existing = await db
//       .select()
//       .from(usersTable)
//       .where(eq(usersTable.email, email));
//     if (existing.length > 0) {
//       return res.status(400).json({ error: "Email already exists." });
//     }

//     // Validate refer code if given
//     let referredByUserId: string | null = null;
//     if (referCode) {
//       const referredUser = await db
//         .select()
//         .from(usersTable)
//         .where(eq(usersTable.referCode, referCode));

//       if (referredUser.length === 0) {
//         return res.status(400).json({ error: "Invalid referral code." });
//       }

//       referredByUserId = referredUser[0].id;
//     }

//     // Generate unique refer code
//     let newReferCode = "";
//     let isUnique = false;
//     while (!isUnique) {
//       newReferCode = generateReferralCode();
//       const check = await db
//         .select()
//         .from(usersTable)
//         .where(eq(usersTable.referCode, newReferCode));
//       isUnique = check.length === 0;
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const token = crypto.randomBytes(32).toString("hex");

//     const insertedUsers = await db
//       .insert(usersTable)
//       .values({
//         fullName,
//         mobileNumber,
//         email,
//         password: hashedPassword,
//         referCode: newReferCode, // their own generated code
//         referredBy: referCode || null, // the code they used
//         verificationToken: token,
//       })
//       .returning();

//     const newUser = insertedUsers[0];

//     // Handle bonus wallet
//     const bonusAmount = "10"; // set your bonus amount

//     if (referredByUserId) {
//       await Promise.all([
//         db.insert(userBonusWalletTable).values({
//           userId: newUser.id,
//           amount: bonusAmount,
//         }),
//         db.insert(userBonusWalletTable).values({
//           userId: referredByUserId,
//           amount: bonusAmount,
//         }),
//       ]);
//     } else {
//       await db.insert(userBonusWalletTable).values({
//         userId: newUser.id,
//         amount: "0",
//       });
//     }

//     const verifyUrl = `http://localhost:3001/verify?token=${token}`;

//     await transporter.sendMail({
//       from: `"Life Good" <${process.env.SMTP_USER}>`,
//       to: email,
//       subject: "Verify Your Email",
//       html: `<p>Click the link below to verify your email:</p>
//              <a href="${verifyUrl}">${verifyUrl}</a>`,
//     });

//     return res
//       .status(201)
//       .json({ message: "Verification email sent. Please check your inbox." });
//   } catch (error) {
//     console.error("Sign-up error:", error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// clientSignup.get("/client/verify", async (req: any, res: any) => {
//   try {
//     const token = typeof req.query.token === "string" ? req.query.token : null;

//     if (!token) {
//       return res.status(400).json({ error: "Invalid token." });
//     }

//     const users = await db
//       .select()
//       .from(usersTable)
//       .where(eq(usersTable.verificationToken, token));

//     if (users.length === 0) {
//       return res.status(400).json({ error: "Invalid or expired token." });
//     }

//     await db
//       .update(usersTable)
//       .set({ isVerified: true, verificationToken: null })
//       .where(eq(usersTable.verificationToken, token));

//     return res.status(200).json({ message: "Email verified successfully." });
//   } catch (error) {
//     console.error("Verification error:", error);
//     return res.status(500).json({ error: "Server error." });
//   }
// });

// export default clientSignup;

//---------------checking--------------------//

import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { db } from "../db";
import { usersTable, userBonusWalletTable } from "../db/schema";
import { eq } from "drizzle-orm";
import nodemailer from "nodemailer";

const clientSignup = express.Router();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function generateUniqueReferralCode(): Promise<string> {
  let code = "";
  let exists = true;
  while (exists) {
    code = crypto.randomBytes(4).toString("hex");
    const found = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.referCode, code));
    exists = found.length > 0;
  }
  return code;
}

clientSignup.post("/client/sign-up", async (req: any, res: any) => {
  try {
    const {
      fullName,
      mobileNumber,
      email,
      password,
      confirmPassword,
      referCode,
    } = req.body;

    if (!fullName || !mobileNumber || !email || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ error: "All required fields are necessary." });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already exists." });
    }

    const myReferCode = await generateUniqueReferralCode();

    let referredByCode: string | null = null;
    if (referCode) {
      const refUser = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.referCode, referCode));
      if (refUser.length === 0) {
        return res.status(400).json({ error: "Invalid referral code." });
      }
      referredByCode = referCode;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(32).toString("hex");

    const [newUser] = await db
      .insert(usersTable)
      .values({
        fullName,
        mobileNumber,
        email,
        password: hashedPassword,
        referCode: myReferCode,
        referredBy: referredByCode,
        verificationToken: token,
      })
      .returning();

    await db.insert(userBonusWalletTable).values({
      userId: newUser.id,
      amount: "0",
    });

    const verifyUrl = `https://taskora-main-ui.vercel.app/verify?token=${token}`;
    await transporter.sendMail({
      from: `"Life Good" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Verify Your Email",
      html: `<p>Click the link below to verify your email:</p>
             <a href="${verifyUrl}">${verifyUrl}</a>`,
    });

    return res.status(201).json({
      message: "Verification email sent. Please check your inbox.",
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

clientSignup.get("/client/verify", async (req: any, res: any) => {
  const token = typeof req.query.token === "string" ? req.query.token : null;

  if (!token) {
    return res.status(400).json({ error: "Invalid token." });
  }

  try {
    await db.transaction(async (tx) => {
      const users = await tx
        .select()
        .from(usersTable)
        .where(eq(usersTable.verificationToken, token));

      if (users.length === 0) {
        throw new Error("Invalid or expired token.");
      }

      const user = users[0];

      await tx
        .update(usersTable)
        .set({ isVerified: true, verificationToken: null })
        .where(eq(usersTable.id, user.id));

      if (!user.referralBonusGranted && user.referredBy) {
        const referrer = await tx
          .select()
          .from(usersTable)
          .where(eq(usersTable.referCode, user.referredBy));

        if (referrer.length > 0) {
          const bonusAmount = 10;

          const userWallet = await tx
            .select()
            .from(userBonusWalletTable)
            .where(eq(userBonusWalletTable.userId, user.id));
          const currentUserBonus = parseFloat(userWallet[0]?.amount || "0");
          await tx
            .update(userBonusWalletTable)
            .set({ amount: (currentUserBonus + bonusAmount).toString() })
            .where(eq(userBonusWalletTable.userId, user.id));

          const refWallet = await tx
            .select()
            .from(userBonusWalletTable)
            .where(eq(userBonusWalletTable.userId, referrer[0].id));
          const currentRefBonus = parseFloat(refWallet[0]?.amount || "0");
          await tx
            .update(userBonusWalletTable)
            .set({ amount: (currentRefBonus + bonusAmount).toString() })
            .where(eq(userBonusWalletTable.userId, referrer[0].id));

          await tx
            .update(usersTable)
            .set({ referralBonusGranted: true })
            .where(eq(usersTable.id, user.id));
        }
      }

      res.status(200).json({ message: "Email verified successfully." });
    });
  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({ error: "Server error." });
  }
});

export default clientSignup;
