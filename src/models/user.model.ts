import mongoose from "mongoose";

interface IUserAccount {
  username?: string;
  fullname: string;
  email: string;
  phone: string;
  profilePictureUrl?: string;
}

interface IUserSecurity {
  password: string;
  gender?: "male" | "female" | "other";
  role?: "user" | "admin" | "captain" | "kitchen";
  tokens: Array<{
    token: string;
    createdAt: Date;
    deviceInfo?: string;
  }>;
}

interface IUserAddress {
  label: string;
  houseNumber: string;
  street: string;
  area: string;
  landmark?: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  coordinates?: {
    lat?: number;
    lng?: number;
  };
}

interface IUserActivity {
  memberSince: Date;
  favorites: mongoose.Types.ObjectId[];
  cart: Array<{
    item: mongoose.Types.ObjectId;
    quantity: number;
  }>;
  orders: mongoose.Types.ObjectId[];
  loyaltyPoints: number;
}

interface IUserPreferences {
  mealType?: string;
  mealSpice?: string;
  mealRestrictions?: string;
  mealMessage?: string;
  notificationsOrder: boolean;
  notificationsReminders: boolean;
  notificationsMenu: boolean;
  notificationsPromotions: boolean;
  paymentMethod: string[];
}

interface IUserStatus {
  isBanned: boolean;
  banReason: string | null;
  bannedAt: Date | null;
  isVerified: boolean;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
}

export interface IUser extends mongoose.Document {
  userID: string;
  account: IUserAccount;
  security: IUserSecurity;
  addresses: IUserAddress[];
  activity: IUserActivity;
  preferences: IUserPreferences;
  status: IUserStatus;
  lastLogin: Date;
  lastProfileUpdate: Date;
  lastPasswordChange: Date;
  createdAt: Date;
  updatedAt: Date;
}

function generateUserId() {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const YYYY = now.getFullYear();
  const MM = pad(now.getMonth() + 1);
  const DD = pad(now.getDate());
  const HH = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  const randomNum = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  return `USER${YYYY}${MM}${DD}${HH}${mm}${ss}${randomNum}`;
}

const UserSchema = new mongoose.Schema(
  {
    userID: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      default: generateUserId,
    },

    // Account Information
    account: {
      username: {
        type: String,
        required: false,
        unique: true,
        trim: true,
        lowercase: true,
      },
      fullname: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
        sparse: true,
        trim: true,
        lowercase: true,
      },
      phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },
      profilePictureUrl: {
        type: String,
        required: false,
      },
    },

    // Security Details
    security: {
      password: {
        type: String,
        required: true,
        select: false,
        trim: true,
      },
      gender: {
        type: String,
        required: false,
        enum: ["male", "female", "other"],
        default: "other",
      },
      role: {
        type: String,
        required: false,
        enum: ["user", "admin", "captain", "kitchen"],
        default: "user",
      },
      tokens: [
        {
          token: {
            type: String,
            required: true,
          },
          createdAt: {
            type: Date,
            default: Date.now,
            expires: "30d",
          },
          deviceInfo: {
            type: String,
            required: false,
          },
        },
      ],
    },

    // Addresses
    addresses: [
      {
        label: {
          type: String,
          required: true,
        },
        houseNumber: {
          type: String,
          required: true,
        },
        street: {
          type: String,
          required: true,
        },
        area: {
          type: String,
          required: true,
        },
        landmark: {
          type: String,
          required: false,
        },
        city: {
          type: String,
          required: true,
        },
        state: {
          type: String,
          required: true,
        },
        zipcode: {
          type: String,
          required: true,
        },
        country: {
          type: String,
          required: true,
        },
        coordinates: {
          lat: {
            type: Number,
          },
          lng: {
            type: Number,
          },
        },
      },
    ],

    // Activity Section
    activity: {
      memberSince: {
        type: Date,
        default: Date.now,
      },
      favorites: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Restaurant",
        },
      ],
      cart: [
        {
          item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MenuItem",
          },
          quantity: {
            type: Number,
            default: 1,
          },
        },
      ],
      orders: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
        },
      ],
      loyaltyPoints: {
        type: Number,
        default: 0,
      },
    },

    // Preferences
    preferences: {
      mealType: {
        type: String,
        required: false,
        default: "none",
      },
      mealSpice: {
        type: String,
        required: false,
        default: "low",
      },
      mealRestrictions: {
        type: String,
        required: false,
        default: "none",
      },
      mealMessage: {
        type: String,
        required: false,
        default: "",
      },
      notificationsOrder: {
        type: Boolean,
        default: false,
      },
      notificationsReminders: {
        type: Boolean,
        default: false,
      },
      notificationsMenu: {
        type: Boolean,
        default: false,
      },
      notificationsPromotions: {
        type: Boolean,
        default: false,
      },
      paymentMethod: [
        {
          type: String,
          required: false,
        },
      ],
    },

    // Status
    status: {
      isBanned: {
        type: Boolean,
        default: false,
      },
      banReason: {
        type: String,
        default: null,
      },
      bannedAt: {
        type: Date,
        default: null,
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
      isActive: {
        type: Boolean,
        default: true,
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

    // Important Timestamps
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    lastProfileUpdate: {
      type: Date,
      default: Date.now,
    },
    lastPasswordChange: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>("User", UserSchema);
