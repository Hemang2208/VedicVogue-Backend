import EmailVerificationModel, { IEmailVerification } from "../../models/EmailVerification/emailVerification.model";
import { Types } from "mongoose";

/**
 * Create or update email verification record
 */
export const createEmailVerificationService = async (
  email: string,
  otp: string,
  userId?: string,
  type: "email-verification" | "password-reset" = "email-verification"
): Promise<IEmailVerification> => {
  try {
    // Remove any existing verification for this email and type
    await EmailVerificationModel.deleteMany({ 
      email: email.toLowerCase().trim(), 
      type 
    });

    // Create new verification record
    const verification = new EmailVerificationModel({
      email: email.toLowerCase().trim(),
      otp,
      userId: userId ? new Types.ObjectId(userId) : undefined,
      type,
      attempts: 0,
      isUsed: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours (1 day)
    });

    return await verification.save();
  } catch (error) {
    throw new Error(`Failed to create email verification: ${(error as Error).message}`);
  }
};

/**
 * Verify OTP for email verification
 */
export const verifyEmailOTPService = async (
  email: string,
  otp: string,
  type: "email-verification" | "password-reset" = "email-verification"
): Promise<{
  success: boolean;
  verification?: IEmailVerification;
  error?: string;
}> => {
  try {
    const verification = await EmailVerificationModel.findOne({
      email: email.toLowerCase().trim(),
      type,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!verification) {
      return {
        success: false,
        error: "Invalid or expired verification code",
      };
    }

    // Check if too many attempts
    if (verification.attempts >= 5) {
      return {
        success: false,
        error: "Too many verification attempts. Please request a new code.",
      };
    }

    // Verify OTP
    if (verification.otp !== otp) {
      // Increment attempts
      verification.attempts += 1;
      await verification.save();
      
      return {
        success: false,
        error: "Invalid verification code",
      };
    }

    // Mark as used
    verification.isUsed = true;
    await verification.save();

    return {
      success: true,
      verification,
    };
  } catch (error) {
    throw new Error(`Failed to verify OTP: ${(error as Error).message}`);
  }
};

/**
 * Get email verification record
 */
export const getEmailVerificationService = async (
  email: string,
  type: "email-verification" | "password-reset" = "email-verification"
): Promise<IEmailVerification | null> => {
  try {
    return await EmailVerificationModel.findOne({
      email: email.toLowerCase().trim(),
      type,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });
  } catch (error) {
    throw new Error(`Failed to get email verification: ${(error as Error).message}`);
  }
};

/**
 * Clean up expired verification records
 */
export const cleanupExpiredVerificationsService = async (): Promise<number> => {
  try {
    const result = await EmailVerificationModel.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    
    return result.deletedCount || 0;
  } catch (error) {
    throw new Error(`Failed to cleanup expired verifications: ${(error as Error).message}`);
  }
};

/**
 * Delete email verification record
 */
export const deleteEmailVerificationService = async (
  email: string,
  type: "email-verification" | "password-reset" = "email-verification"
): Promise<boolean> => {
  try {
    const result = await EmailVerificationModel.deleteMany({
      email: email.toLowerCase().trim(),
      type,
    });
    
    return (result.deletedCount || 0) > 0;
  } catch (error) {
    throw new Error(`Failed to delete email verification: ${(error as Error).message}`);
  }
};
