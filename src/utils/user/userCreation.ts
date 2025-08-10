import {
  IUser,
  IUserAccount,
  IUserAddress,
  IUserSecurity,
  IUserActivity,
  IUserPreferences,
  IUserAdditionalInfo,
  IUserStatus,
} from "../../models/Auth/user.model";
import { hashPassword } from "../password";
import { generateUserId, getClientIpAddress } from "../helpers";
import {
  getUserByEmailService,
  getUserByPhoneService,
  createUserService,
} from "../../services/Auth/user.service";

export interface CreateUserData {
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

export const prepareUserData = async (
  data: CreateUserData,
  req: any
): Promise<Partial<IUser>> => {
  const hashedPassword: string = await hashPassword(data.account.password);

  const ipAddress: string = getClientIpAddress(req);

  const UserID: string = generateUserId();

  const userData: Partial<IUser> = {
    ...data,
    userID: UserID,
    fullname: data.fullname.trim(),
    account: {
      ...data.account,
      email: data.account.email.toLowerCase().trim(),
      password: hashedPassword,
      gender: data.account.gender || "other",
      profilePictureUrl: data.account.profilePictureUrl || "",
    },
    security: {
      ...data.security,
      role: data.security?.role || "user",
      ipAddress,
      tokens: data.security?.tokens || [],
    },
    addresses:
      data.addresses?.map((address) => ({
        ...address,
        landmark: address.landmark || "",
        isDeleted: address.isDeleted || false,
        deletedAt: address.deletedAt || null,
      })) || [],
    activity: {
      ...data.activity,
      memberSince: data.activity?.memberSince || new Date(),
      favorites: data.activity?.favorites || [],
      cart: data.activity?.cart || [],
      orders: data.activity?.orders || [],
      contacts: data.activity?.contacts || [],
      loyaltyPoints: data.activity?.loyaltyPoints || 0,
    },
    preferences: {
      meals: {
        type: data.preferences?.meals?.type || "none",
        spice: data.preferences?.meals?.spice || "low",
        restrictions: data.preferences?.meals?.restrictions || "none",
        message: data.preferences?.meals?.message || "",
      },
      notifications: {
        order: data.preferences?.notifications?.order || false,
        reminders: data.preferences?.notifications?.reminders || false,
        menu: data.preferences?.notifications?.menu || false,
        promotions: data.preferences?.notifications?.promotions || false,
      },
      paymentMethod: data.preferences?.paymentMethod || [],
    },
    additionalInfo: {
      coordinates: {
        latitude: data.additionalInfo?.coordinates?.latitude,
        longitude: data.additionalInfo?.coordinates?.longitude,
      },
      timezone: data.additionalInfo?.timezone || "",
      isp: data.additionalInfo?.isp || "",
      org: data.additionalInfo?.org || "",
      session: {
        timestamp: data.additionalInfo?.session?.timestamp || Date.now(),
        sessionId: data.additionalInfo?.session?.sessionId || "",
        referrer: data.additionalInfo?.session?.referrer || "",
        currentUrl: data.additionalInfo?.session?.currentUrl || "",
        timeZone: data.additionalInfo?.session?.timeZone || "",
        timeZoneOffset: data.additionalInfo?.session?.timeZoneOffset || 0,
        language: data.additionalInfo?.session?.language || "",
        languages: data.additionalInfo?.session?.languages || [],
        visitDuration: data.additionalInfo?.session?.visitDuration || 0,
        pageLoadTime: data.additionalInfo?.session?.pageLoadTime || 0,
      },
      browser: {
        name: data.additionalInfo?.browser?.name || "",
        version: data.additionalInfo?.browser?.version || "",
        engine: data.additionalInfo?.browser?.engine || "",
        engineVersion: data.additionalInfo?.browser?.engineVersion || "",
        vendor: data.additionalInfo?.browser?.vendor || "",
        mobile: data.additionalInfo?.browser?.mobile || false,
        tablet: data.additionalInfo?.browser?.tablet || false,
        desktop: data.additionalInfo?.browser?.desktop || false,
      },
      headers: {
        userAgent: data.additionalInfo?.headers?.userAgent || "",
        accept: data.additionalInfo?.headers?.accept || "",
        acceptLanguage: data.additionalInfo?.headers?.acceptLanguage || "",
        acceptEncoding: data.additionalInfo?.headers?.acceptEncoding || "",
        secChUa: data.additionalInfo?.headers?.secChUa || "",
        secChUaPlatform: data.additionalInfo?.headers?.secChUaPlatform || "",
        secChUaMobile: data.additionalInfo?.headers?.secChUaMobile || "",
        secFetchSite: data.additionalInfo?.headers?.secFetchSite || "",
        secFetchMode: data.additionalInfo?.headers?.secFetchMode || "",
        secFetchDest: data.additionalInfo?.headers?.secFetchDest || "",
      },
    },
    status: {
      ban: {
        isBanned: data.status?.ban?.isBanned || false,
        banReason: data.status?.ban?.banReason || null,
        bannedAt: data.status?.ban?.bannedAt || null,
      },
      isVerified: data.status?.isVerified || false,
      isActive: data.status?.isActive !== false, // Default to true unless explicitly false
      isDeleted: data.status?.isDeleted || false,
      deletedAt: data.status?.deletedAt || null,
    },
    lastLogin: data.lastLogin || new Date(),
    lastLogout: data.lastLogout || null,
    lastProfileUpdate: data.lastProfileUpdate || new Date(),
    lastPasswordChange: data.lastPasswordChange || new Date(),
  };

  return userData;
};

export const processUserCreation = async (
  data: CreateUserData,
  req: any
): Promise<{
  success: boolean;
  user?: any;
  error?: {
    statusCode: number;
    message: string;
  };
}> => {
  try {
    const usedEmail = await getUserByEmailService(data.account.email);
    if (usedEmail) {
      return {
        success: false,
        error: {
          statusCode: 409,
          message: "Email already in use",
        },
      };
    }

    const usedPhone = await getUserByPhoneService(data.account.phone);
    if (usedPhone) {
      return {
        success: false,
        error: {
          statusCode: 410,
          message: "Phone number already in use",
        },
      };
    }

    const userData = await prepareUserData(data, req);

    const newUser = await createUserService(userData);

    const responseData = {
      userID: newUser.userID,
      fullname: newUser.fullname,
      email: newUser.account.email,
      role: newUser.security?.role || "user",
      memberSince: newUser.activity?.memberSince,
      createdAt: newUser.createdAt,
    };

    return {
      success: true,
      user: responseData,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        statusCode: 500,
        message: `Failed to create user: ${(error as Error).message}`,
      },
    };
  }
};
