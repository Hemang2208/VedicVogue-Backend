import applicationRoutes from "./application.route";
import internRoutes from "./intern.route";

import { Router } from "express";
const router = Router();

router.use("/applications", applicationRoutes);
router.use("/interns", internRoutes);

export default router;
