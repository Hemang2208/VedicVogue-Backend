import mongoose from "mongoose";
import { generateUserId } from "../../utils/helpers";

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
  tokens: Array<{
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
    };
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
  coordinates: {
    latitude: number;
    longitude: number;
  };
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
          latitude: {
            type: Number,
            default: 0,
          },
          longitude: {
            type: Number,
            default: 0,
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

    additionalInfo: {
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
