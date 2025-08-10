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
    },
    security: {
      ...data.security,
      role: data.security?.role || "user",
      ipAddress,
      tokens: [],
    },
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
