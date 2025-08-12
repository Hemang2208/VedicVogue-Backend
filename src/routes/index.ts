import applicationRoutes from "./Application/application.route";
import internRoutes from "./Application/intern.route";
import generalContactRoutes from "./Contact/generalContact.route";
import nodemailerRoutes from "./nodemailer.route";
import userRoutes from "./Auth/user.route";
import recoveryRoutes from "./Auth/recovery.route";
import forgotPasswordRoutes from "./Auth/forgotPassword.route";
import emailVerificationRoutes from "./EmailVerification/emailVerification.route";

import { Router } from "express";
const router = Router();

router.use("/applications", applicationRoutes);
router.use("/users", userRoutes);
router.use("/interns", internRoutes);
router.use("/contacts", generalContactRoutes);
router.use("/emails", nodemailerRoutes);
router.use("/recovery", recoveryRoutes);
router.use("/forgot-password", forgotPasswordRoutes);
router.use("/email-verification", emailVerificationRoutes);

export default router;
