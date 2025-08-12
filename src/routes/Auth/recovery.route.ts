import express from "express";
import {
  fixCorruptedPasswordsController,
  setUserPasswordController,
} from "../../controllers/Auth/recovery.controller";

const router = express.Router();

// Emergency recovery routes (development only)
router.post("/fix-corrupted-passwords", fixCorruptedPasswordsController);
router.post("/set-user-password", setUserPasswordController);

export default router;
