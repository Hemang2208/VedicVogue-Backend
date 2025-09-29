import mongoose from "mongoose";
import { generateUserId, generateReferralCode } from "../../utils/helpers";
import { encrypt } from "../../configs/crypto";

export interface IUserAccount {
  email: string;
  phone: string;
  password: string;
  gender?: "male" | "female" | "other";
  profilePictureUrl?: string;
}

export interface IUserSecurity {
  role?: "user" | "admin" | "captain" | "kitchen";
  ipAddress?: string;
  twoFactorAuth?: boolean;
  loginNotifications?: boolean;
  sessionTimeout?: boolean;
  deviceTracking?: boolean;
  passwordExpiry?: boolean;
  tokens: Array<{
    _id?: string;
    token: string;
    createdAt: Date;
    deviceInfo?: string;
    device: {
      ipAddress?: string;
      type: string;
      brand: string;
      model: string;
      browser: string;
      os: string;
      memory: number;
      cores: number;
      location?: string;
    };
  }>;
  activities: Array<{
    _id?: string;
    type: string;
    description: string;
    timestamp: Date;
    status: string;
    location?: string;
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: {
      type: string;
      brand: string;
      model: string;
      browser: string;
      os: string;
      memory?: number;
      cores?: number;
      location?: string;
    };
    metadata?: any;
  }>;
}

export interface IUserAddress {
  label: string;
  houseNumber: string;
  street: string;
  area: string;
  landmark?: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  isDeleted?: boolean;
  deletedAt?: Date | null;
}

export interface IUserActivity {
  memberSince: Date;
  favorites: Array<{
    kitchens: mongoose.Types.ObjectId;
    dishes: mongoose.Types.ObjectId[];
  }>;
  cart: Array<{
    item: mongoose.Types.ObjectId;
    quantity: number;
  }>;
  orders: mongoose.Types.ObjectId[];
  contacts: mongoose.Types.ObjectId[];
  loyaltyPoints: number;
}

export interface IUserPreferences {
  meals: {
    type: string;
    spice: string;
    restrictions: string;
    message: string;
  };
  notifications: {
    order: boolean;
    reminders: boolean;
    menu: boolean;
    promotions: boolean;
  };
  paymentMethod: string[];
}

export interface IUserReferral {
  referralCode: string;
  referralId: string;
  referredBy?: {
    userId: mongoose.Types.ObjectId;
    referralCode: string;
    joinedAt: Date;
    rewardsClaimed: boolean;
    rewardsClaimedAt?: Date;
  };
  referrals: Array<{
    _id?: string;
    userId: mongoose.Types.ObjectId;
    referralCode: string;
    joinedAt: Date;
    status: 'pending' | 'verified' | 'completed';
    rewardEarned: number;
    rewardClaimed: boolean;
    rewardClaimedAt?: Date;
    orderCompleted: boolean;
    firstOrderDate?: Date;
  }>;
  stats: {
    totalReferrals: number;
    successfulReferrals: number;
    totalRewardsEarned: number;
    totalRewardsClaimed: number;
    pendingRewards: number;
    referralConversionRate: number;
  };
  rewards: Array<{
    _id?: string;
    type: 'referral_bonus' | 'signup_bonus' | 'first_order_bonus';
    amount: number;
    description: string;
    earnedAt: Date;
    claimed: boolean;
    claimedAt?: Date;
    expiresAt?: Date;
    metadata?: any;
  }>;
  settings: {
    shareViaEmail: boolean;
    shareViaSMS: boolean;
    shareViaSocial: boolean;
    notifyOnReferralJoin: boolean;
    notifyOnRewardEarned: boolean;
  };
}

export interface IUserStatus {
  ban: {
    isBanned: boolean;
    banReason: string | null;
    bannedAt: Date | null;
  };
  isVerified: boolean;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
}

export interface IUserAdditionalInfo {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  timezone: string;
  isp: string;
  org: string;
  session: {
    timestamp: number;
    sessionId: string;
    referrer: string;
    currentUrl: string;
    timeZone: string;
    timeZoneOffset: number;
    language: string;
    languages: string[];
    visitDuration: number;
    pageLoadTime: number;
  };
  browser: {
    name: string;
    version: string;
    engine: string;
    engineVersion: string;
    vendor: string;
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  };
  headers: {
    userAgent: string;
    accept: string;
    acceptLanguage: string;
    acceptEncoding: string;
    secChUa: string;
    secChUaPlatform: string;
    secChUaMobile: string;
    secFetchSite: string;
    secFetchMode: string;
    secFetchDest: string;
  };
}

export interface IUser extends mongoose.Document {
  userID: string;
  fullname: string;
  account: IUserAccount;
  security: IUserSecurity;
  addresses: IUserAddress[];
  activity: IUserActivity;
  preferences: IUserPreferences;
  referral: IUserReferral;
  additionalInfo: IUserAdditionalInfo;
  status: IUserStatus;
  lastLogin: Date;
  lastLogout: Date | null;
  lastProfileUpdate: Date;
  lastPasswordChange: Date;
  createdAt: Date;
  updatedAt: Date;
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
    fullname: {
      type: String,
      required: true,
      trim: true,
    },

    // Account Information
    account: {
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
      profilePictureUrl: {
        type: String,
        required: false,
        default: "",
      },
    },

    // Security Details
    security: {
      role: {
        type: String,
        required: false,
        enum: ["user", "admin", "captain", "kitchen"],
        default: "user",
      },
      ipAddress: {
        type: String,
        required: false,
        trim: true,
        default: "UNKNOWN",
      },
      twoFactorAuth: {
        type: Boolean,
        default: false,
      },
      loginNotifications: {
        type: Boolean,
        default: true,
      },
      sessionTimeout: {
        type: Boolean,
        default: true,
      },
      deviceTracking: {
        type: Boolean,
        default: true,
      },
      passwordExpiry: {
        type: Boolean,
        default: false,
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
            default: "",
          },
          device: {
            ipAddress: {
              type: String,
              required: false,
              trim: true,
              default: "UNKNOWN",
            },
            type: {
              type: String,
              required: false,
              default: "",
            },
            brand: {
              type: String,
              required: false,
              default: "",
            },
            model: {
              type: String,
              required: false,
              default: "",
            },
            browser: {
              type: String,
              required: false,
              default: "",
            },
            os: {
              type: String,
              required: false,
              default: "",
            },
            memory: {
              type: Number,
              required: false,
              default: 0,
            },
            cores: {
              type: Number,
              required: false,
              default: 0,
            },
            location: {
              type: String,
              required: false,
              default: "",
            },
          },
        },
      ],
      activities: [
        {
          type: {
            type: String,
            required: true,
            enum: [
              "login",
              "logout", 
              "password_change",
              "settings_change",
              "session_terminated",
              "all_sessions_terminated",
              "failed_login",
              "account_locked",
              "two_factor_enabled",
              "two_factor_disabled",
              "password_reset_requested",
              "password_reset_completed",
              "suspicious_activity",
              "security_breach_detected",
              "device_added",
              "device_removed"
            ],
            index: true,
          },
          description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
          },
          timestamp: {
            type: Date,
            required: true,
            default: Date.now,
            index: true,
          },
          status: {
            type: String,
            required: true,
            enum: ["success", "failed", "warning", "info", "error"],
            default: "success",
            index: true,
          },
          location: {
            type: String,
            trim: true,
            maxlength: 200,
          },
          ipAddress: {
            type: String,
            trim: true,
          },
          userAgent: {
            type: String,
            trim: true,
            maxlength: 1000,
          },
          deviceInfo: {
            type: {
              type: String,
              trim: true,
            },
            brand: {
              type: String,
              trim: true,
            },
            model: {
              type: String,
              trim: true,
            },
            browser: {
              type: String,
              trim: true,
            },
            os: {
              type: String,
              trim: true,
            },
            memory: {
              type: Number,
              min: 0,
            },
            cores: {
              type: Number,
              min: 0,
            },
            location: {
              type: String,
              trim: true,
            },
          },
          metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
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
        isDeleted: {
          type: Boolean,
          default: false,
        },
        deletedAt: {
          type: Date,
          default: null,
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
          kitchens: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Kitchen",
          },
          dishes: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: "MenuItem",
            },
          ],
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
      contacts: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User-Contact",
        },
      ],
      loyaltyPoints: {
        type: Number,
        default: 0,
      },
    },

    // Preferences
    preferences: {
      meals: {
        type: {
          type: String,
          required: false,
          default: "none",
        },
        spice: {
          type: String,
          required: false,
          default: "low",
        },
        restrictions: {
          type: String,
          required: false,
          default: "none",
        },
        message: {
          type: String,
          required: false,
          default: "",
        },
      },
      notifications: {
        order: {
          type: Boolean,
          default: false,
        },
        reminders: {
          type: Boolean,
          default: false,
        },
        menu: {
          type: Boolean,
          default: false,
        },
        promotions: {
          type: Boolean,
          default: false,
        },
      },
      paymentMethod: [
        {
          type: String,
          required: false,
        },
      ],
    },

    // Referral System
    referral: {
      referralCode: {
        type: String,
        required: true,
        unique: true,
        sparse: true,
        trim: true,
        uppercase: true,
        default: generateReferralCode,
        index: true,
      },
      referralId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        default: () => encrypt(new mongoose.Types.ObjectId().toString()),
        index: true,
      },
      referredBy: {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: false,
        },
        referralCode: {
          type: String,
          required: false,
          trim: true,
          uppercase: true,
        },
        joinedAt: {
          type: Date,
          required: false,
        },
        rewardsClaimed: {
          type: Boolean,
          default: false,
        },
        rewardsClaimedAt: {
          type: Date,
          required: false,
        },
      },
      referrals: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          referralCode: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
          },
          joinedAt: {
            type: Date,
            required: true,
            default: Date.now,
          },
          status: {
            type: String,
            required: true,
            enum: ['pending', 'verified', 'completed'],
            default: 'pending',
            index: true,
          },
          rewardEarned: {
            type: Number,
            default: 0,
            min: 0,
          },
          rewardClaimed: {
            type: Boolean,
            default: false,
          },
          rewardClaimedAt: {
            type: Date,
            required: false,
          },
          orderCompleted: {
            type: Boolean,
            default: false,
          },
          firstOrderDate: {
            type: Date,
            required: false,
          },
        },
      ],
      stats: {
        totalReferrals: {
          type: Number,
          default: 0,
          min: 0,
        },
        successfulReferrals: {
          type: Number,
          default: 0,
          min: 0,
        },
        totalRewardsEarned: {
          type: Number,
          default: 0,
          min: 0,
        },
        totalRewardsClaimed: {
          type: Number,
          default: 0,
          min: 0,
        },
        pendingRewards: {
          type: Number,
          default: 0,
          min: 0,
        },
        referralConversionRate: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
      },
      rewards: [
        {
          type: {
            type: String,
            required: true,
            enum: ['referral_bonus', 'signup_bonus', 'first_order_bonus'],
            index: true,
          },
          amount: {
            type: Number,
            required: true,
            min: 0,
          },
          description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
          },
          earnedAt: {
            type: Date,
            required: true,
            default: Date.now,
          },
          claimed: {
            type: Boolean,
            default: false,
            index: true,
          },
          claimedAt: {
            type: Date,
            required: false,
          },
          expiresAt: {
            type: Date,
            required: false,
          },
          metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
          },
        },
      ],
      settings: {
        shareViaEmail: {
          type: Boolean,
          default: true,
        },
        shareViaSMS: {
          type: Boolean,
          default: true,
        },
        shareViaSocial: {
          type: Boolean,
          default: true,
        },
        notifyOnReferralJoin: {
          type: Boolean,
          default: true,
        },
        notifyOnRewardEarned: {
          type: Boolean,
          default: true,
        },
      },
    },

    additionalInfo: {
      coordinates: {
        latitude: {
          type: Number,
          default: 0,
        },
        longitude: {
          type: Number,
          default: 0,
        },
      },
      timezone: {
        type: String,
        default: "",
      },
      isp: {
        type: String,
        default: "",
      },
      org: {
        type: String,
        default: "",
      },
      session: {
        timestamp: {
          type: Number,
          default: 0,
        },
        sessionId: {
          type: String,
          default: "",
        },
        referrer: {
          type: String,
          default: "",
        },
        currentUrl: {
          type: String,
          default: "",
        },
        timeZone: {
          type: String,
          default: "",
        },
        timeZoneOffset: {
          type: Number,
          default: 0,
        },
        language: {
          type: String,
          default: "",
        },
        languages: [
          {
            type: String,
          },
        ],
        visitDuration: {
          type: Number,
          default: 0,
        },
        pageLoadTime: {
          type: Number,
          default: 0,
        },
      },
      browser: {
        name: {
          type: String,
          default: "",
        },
        version: {
          type: String,
          default: "",
        },
        engine: {
          type: String,
          default: "",
        },
        engineVersion: {
          type: String,
          default: "",
        },
        vendor: {
          type: String,
          default: "",
        },
        mobile: {
          type: Boolean,
          default: false,
        },
        tablet: {
          type: Boolean,
          default: false,
        },
        desktop: {
          type: Boolean,
          default: false,
        },
      },
      headers: {
        userAgent: {
          type: String,
          default: "",
        },
        accept: {
          type: String,
          default: "",
        },
        acceptLanguage: {
          type: String,
          default: "",
        },
        acceptEncoding: {
          type: String,
          default: "",
        },
        secChUa: {
          type: String,
          default: "",
        },
        secChUaPlatform: {
          type: String,
          default: "",
        },
        secChUaMobile: {
          type: String,
          default: "",
        },
        secFetchSite: {
          type: String,
          default: "",
        },
        secFetchMode: {
          type: String,
          default: "",
        },
        secFetchDest: {
          type: String,
          default: "",
        },
      },
    },

    // Status
    status: {
      ban: {
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
    lastLogout: {
      type: Date,
      default: null,
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

const UserModel = mongoose.model<IUser>("User", UserSchema);

export default UserModel;
