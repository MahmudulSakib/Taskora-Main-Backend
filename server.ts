import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import clientSignup from "./client/signup";
import clientLogin from "./client/login";
import clientLogout from "./client/logout";
import clientInfo from "./client/updateProfile";
import clientfogotPassword from "./client/forgotPassword";
import clientResetPassword from "./client/resetPassword";
import clientAddmoney from "./client/clientaddmoneyrequest";
import clientMobileReacharge from "./client/clientMobileReachrge";
import clientFund from "./client/clientFund";
import clientDriveOffer from "./client/clientdriveoffer";
import clientJobPosts from "./client/clientjobpost";
import clientmicrojob from "./client/clientmicrojob";
import clientbonusad from "./client/clientbonusadd";
import passport from "passport";
import clientQuiz from "./client/clientquiz";
import clientaisubs from "./client/clientAitools";
import clientwelcomeoffer from "./client/clientwelcomeoffer";
import clientbonus from "./client/clientbonus";
import bonusWithdraw from "./client/clientbonuswithdraw";
import statusTimeline from "./client/clientunified";
import clientNotification from "./client/clientnotification";
import clientranks from "./client/clientsranks";
import vendorShipRoute from "./client/clientvendorship";
import clientCarousel from "./client/clientcarousel";

const app = express();
const port = 5000;

const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use("/", clientLogin);
app.use("/", clientSignup);
app.use("/", clientLogout);
app.use("/", clientInfo);
app.use("/", clientfogotPassword);
app.use("/", clientResetPassword);
app.use("/", clientAddmoney);
app.use("/", clientMobileReacharge);
app.use("/", clientFund);
app.use("/", clientMobileReacharge);
app.use("/", clientDriveOffer);
app.use("/", clientJobPosts);
app.use("/", clientmicrojob);
app.use("/", clientbonusad);
app.use("/", clientQuiz);
app.use("/", clientaisubs);
app.use("/", clientwelcomeoffer);
app.use("/", clientbonus);
app.use("/", bonusWithdraw);
app.use("/", statusTimeline);
app.use("/", clientNotification);
app.use("/", clientranks);
app.use("/", vendorShipRoute);
app.use("/", clientCarousel);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
