import { IUser } from "../../models/Auth/user.model";
import { hashPassword, validatePassword } from "../password";
import { generateUserId, getClientIpAddress } from "../helpers";
import {
  getUserByEmailService,
  getUserByPhoneService,
  createUserService,
} from "../../services/Auth/user.service";

export interface CreateUserData {
  fullname: string;
  account: {
    email: string;
    phone: string;
    password: string;
    gender?: "male" | "female" | "other";
    profilePictureUrl?: string;
  };
  addresses?:
    | {
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
          latitude: number;
          longitude: number;
        } | null;
      }[]
    | undefined;
  security?: {
    role?: "user" | "admin" | "captain" | "kitchen";
    ipAddress?: string;
  };
  additionalInfo?: any;
}

/**
 * Validate user creation data
 */
export const validateUserCreationData = (
  data: CreateUserData
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Check required fields
  if (!data.fullname || data.fullname.trim().length === 0) {
    errors.push("Full name is required");
  }

  if (!data.account?.email) {
    errors.push("Email is required");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.account.email)) {
      errors.push("Invalid email format");
    }
  }

  if (!data.account?.phone) {
    errors.push("Phone number is required");
  } else {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(data.account.phone)) {
      errors.push("Invalid phone number format");
    }
  }

  if (!data.account?.password) {
    errors.push("Password is required");
  } else {
    const passwordValidation = validatePassword(data.account.password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
  }

  // Validate name length
  if (data.fullname && data.fullname.length > 100) {
    errors.push("Full name must not exceed 100 characters");
  }

  // Validate email length
  if (data.account?.email && data.account.email.length > 255) {
    errors.push("Email must not exceed 255 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Check if email or phone already exists
 */
export const checkUserExistence = async (
  email: string,
  phone: string
): Promise<{
  emailExists: boolean;
  phoneExists: boolean;
  existingUser?: IUser;
}> => {
  const [existingUserByEmail, existingUserByPhone] = await Promise.all([
    getUserByEmailService(email),
    getUserByPhoneService(phone),
  ]);

  return {
    emailExists: !!existingUserByEmail,
    phoneExists: !!existingUserByPhone,
    existingUser: existingUserByEmail || existingUserByPhone || undefined,
  };
};

/**
 * Prepare user data for creation
 */
export const prepareUserData = async (
  data: CreateUserData,
  req: any
): Promise<Partial<IUser>> => {
  // Hash the password
  const hashedPassword = await hashPassword(data.account.password);

  // Get IP address
  const ipAddress = getClientIpAddress(req);

  // Generate unique user ID
  const userID = generateUserId();

  // Prepare the final user data
  const userData: Partial<IUser> = {
    userID,
    fullname: data.fullname.trim(),
    account: {
      ...data.account,
      email: data.account.email.toLowerCase().trim(),
      password: hashedPassword,
    },
    security: {
      role: data.security?.role || "user",
      ipAddress,
      tokens: [],
    },
    addresses: data.addresses
      ? data.addresses.map((addr) => ({
          ...addr,
          coordinates: addr.coordinates || {
            latitude: 0,
            longitude: 0,
          },
        }))
      : undefined,
    activity: {
      memberSince: new Date(),
      favorites: [],
      cart: [],
      orders: [],
      contacts: [],
      loyaltyPoints: 0,
    },
    preferences: {
      meals: {
        type: "",
        spice: "",
        restrictions: "",
        message: "",
      },
      notifications: {
        order: true,
        reminders: true,
        menu: true,
        promotions: true,
      },
      paymentMethod: [],
    },
    status: {
      ban: {
        isBanned: false,
        banReason: null,
        bannedAt: null,
      },
      isVerified: false,
      isActive: true,
      isDeleted: false,
      deletedAt: null,
    },
    additionalInfo: data.additionalInfo || {},
    lastLogin: new Date(),
    lastProfileUpdate: new Date(),
    lastPasswordChange: new Date(),
  };

  return userData;
};

/**
 * Create user and return sanitized response data
 */
export const createUserAndGetResponse = async (userData: Partial<IUser>) => {
  // Create the user
  const newUser = await createUserService(userData);

  // Prepare response data (sanitized)
  const responseData = {
    userID: newUser.userID,
    fullname: newUser.fullname,
    email: newUser.account.email,
    role: newUser.security?.role || "user",
    memberSince: newUser.activity?.memberSince,
    createdAt: newUser.createdAt,
  };

  return responseData;
};

/**
 * Complete user creation process
 */
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
    // Validate input data
    const validation = validateUserCreationData(data);
    if (!validation.isValid) {
      return {
        success: false,
        error: {
          statusCode: 400,
          message: `Validation failed: ${validation.errors.join(", ")}`,
        },
      };
    }

    // Check if user already exists
    const existence = await checkUserExistence(
      data.account.email,
      data.account.phone
    );

    if (existence.emailExists) {
      return {
        success: false,
        error: {
          statusCode: 409,
          message: "Email already in use",
        },
      };
    }

    if (existence.phoneExists) {
      return {
        success: false,
        error: {
          statusCode: 410,
          message: "Phone number already in use",
        },
      };
    }

    // Prepare user data
    const userData = await prepareUserData(data, req);

    // Create user and get response
    const responseData = await createUserAndGetResponse(userData);

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
