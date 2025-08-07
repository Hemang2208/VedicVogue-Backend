import mongoose, { Document, Schema } from "mongoose";

// Interface for General Contact
export interface IGeneralContact extends Document {
  name: string;
  email: string;
  phone?: string;
  issueType: string;
  subject: string;
  message: string;
  priority?: string;
  ipAddress: string;
  status: "pending" | "in-progress" | "resolved" | "closed";
  assignedTo?: string;
  responseNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  customerSatisfactionRating?: number; // 1-5 rating
  followUpRequired: boolean;
  isDeleted?: boolean;
  deletedAt?: Date;
}

// Schema for General Contact
const GeneralContactSchema = new Schema<IGeneralContact>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    issueType: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      required: false,
      trim: true,
      default: "low",
    },
    ipAddress: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      required: false,
      enum: {
        values: ["pending", "in-progress", "resolved", "closed"],
        message: "{VALUE} is not a valid status",
      },
      default: "pending",
    },
    assignedTo: {
      type: String,
      trim: true,
      default: "",
    },
    responseNotes: {
      type: String,
      trim: true,
      default: "",
    },
    resolvedAt: {
      type: Date,
    },
    customerSatisfactionRating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    followUpRequired: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "general_contacts",
  }
);

export const GeneralContact = mongoose.model<IGeneralContact>(
  "GeneralContact",
  GeneralContactSchema
);
export default GeneralContact;
