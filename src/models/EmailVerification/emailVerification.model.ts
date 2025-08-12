import mongoose from "mongoose";

export interface IEmailVerification {
  email: string;
  otp: string;
  userId?: mongoose.Types.ObjectId;
  type: "email-verification" | "password-reset";
  attempts: number;
  isUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EmailVerificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    otp: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    type: {
      type: String,
      required: true,
      enum: ["email-verification", "password-reset"],
      default: "email-verification",
    },
    attempts: {
      type: Number,
      default: 0,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now (1 day)
    },
  },
  {
    timestamps: true,
  }
);

// Index for cleanup of expired documents
EmailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for efficient queries
EmailVerificationSchema.index({ email: 1, type: 1 });
EmailVerificationSchema.index({ userId: 1, type: 1 });

const EmailVerificationModel = mongoose.model<IEmailVerification & mongoose.Document>(
  "EmailVerification",
  EmailVerificationSchema
);

export default EmailVerificationModel;
