import applicationRoutes from "./Application/application.route";
import internRoutes from "./Application/intern.route";
import generalContactRoutes from "./Contact/generalContact.route";
import nodemailerRoutes from "./nodemailer.route";
import userRoutes from "./Auth/user.route";

import { Router } from "express";
const router = Router();

router.use("/applications", applicationRoutes);
router.use("/users", userRoutes);
router.use("/interns", internRoutes);
router.use("/contacts", generalContactRoutes);
router.use("/emails", nodemailerRoutes);

export default router;
