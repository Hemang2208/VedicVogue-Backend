import { Request, Response } from "express";
import { 
  createEmailVerificationService, 
  verifyEmailOTPService 
} from "../../services/EmailVerification/emailVerification.service";
import { 
  getUserByEmailService, 
  updateUserStatusService 
} from "../../services/Auth/user.service";
import { sendVerificationEmail } from "../../services/nodemailer.service";
import { decrypt, encrypt } from "../../configs/crypto";
import { generateOTP } from "../../utils/otp";

/**
 * Generate and send OTP for email verification
 */
export const sendVerificationOTPController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { data } = req.body as unknown as { data: string };
    const { email } = JSON.parse(decrypt(data));

    if (!email) {
      (res as any).status(400).json({
        success: false,
        message: "Email is required",
      });
      return;
    }

    // Check if user exists
    const user = await getUserByEmailService(email.toLowerCase().trim());
    if (!user) {
      (res as any).status(404).json({
        success: false,
        message: "User not found with this email address",
      });
      return;
    }

    // Check if user is already verified
    if (user.status.isVerified) {
      (res as any).status(400).json({
        success: false,
        message: "Email is already verified",
      });
      return;
    }

    // Generate 6-digit OTP
    const otp = generateOTP(6);

    // Store OTP in database
    await createEmailVerificationService(
      email,
      otp,
      (user as any)._id.toString(),
      "email-verification"
    );

    // Send OTP via email
    await sendVerificationEmail({
      email: email,
      name: user.fullname,
      otp: otp,
    });

    const encryptedData = encrypt(JSON.stringify({ 
      email: email,
      message: "Verification code sent successfully" 
    }));

    (res as any).status(200).json({
      success: true,
      message: "Verification code sent to your email",
      data: encryptedData,
    });
  } catch (error) {
    console.error("Error sending verification OTP:", error);
    (res as any).status(500).json({
      success: false,
      message: "Failed to send verification code",
      error: process.env.NODE_ENV === "development" ? (error as Error).message : undefined,
    });
  }
};

/**
 * Verify OTP and update user verification status
 */
export const verifyEmailOTPController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { data } = req.body as unknown as { data: string };
    const { email, otp } = JSON.parse(decrypt(data));

    if (!email || !otp) {
      (res as any).status(400).json({
        success: false,
        message: "Email and verification code are required",
      });
      return;
    }

    // Verify OTP
    const verificationResult = await verifyEmailOTPService(
      email,
      otp,
      "email-verification"
    );

    if (!verificationResult.success) {
      (res as any).status(400).json({
        success: false,
        message: verificationResult.error,
      });
      return;
    }

    // Get user and update verification status
    const user = await getUserByEmailService(email.toLowerCase().trim());
    if (!user) {
      (res as any).status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Update user verification status
    const updatedUser = await updateUserStatusService(
      (user as any)._id.toString(),
      { isVerified: true }
    );

    if (!updatedUser) {
      (res as any).status(500).json({
        success: false,
        message: "Failed to update verification status",
      });
      return;
    }

    const encryptedData = encrypt(JSON.stringify({
      email: email,
      isVerified: true,
      message: "Email verified successfully"
    }));

    (res as any).status(200).json({
      success: true,
      message: "Email verified successfully",
      data: encryptedData,
    });
  } catch (error) {
    console.error("Error verifying email OTP:", error);
    (res as any).status(500).json({
      success: false,
      message: "Failed to verify email",
      error: process.env.NODE_ENV === "development" ? (error as Error).message : undefined,
    });
  }
};
