import UserModel from "../../models/Auth/user.model";
import { hashPassword } from "../../utils/password";

/**
 * Emergency controller to fix corrupted user passwords
 * This should only be used in development/emergency situations
 */

export const fixCorruptedPasswordsController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    if (process.env.NODE_ENV === "production") {
      res.status(403).json({
        success: false,
        message: "This endpoint is not available in production",
      });
      return;
    }

    // Find all users without passwords
    const usersWithoutPassword = await UserModel.find({
      "account.password": { $exists: false },
      "status.isDeleted": false,
    }).select("+account.password account.email");

    console.log(`Found ${usersWithoutPassword.length} users without passwords`);

    const results = [];

    for (const user of usersWithoutPassword) {
      const email = (user as any).account.email;
      // Generate a temporary password (you should change this to a secure method)
      const tempPassword = `TempPass123!_${Date.now()}`;
      const hashedPassword = await hashPassword(tempPassword);

      await UserModel.updateOne(
        { _id: user._id },
        {
          $set: {
            "account.password": hashedPassword,
            lastPasswordChange: new Date(),
          },
        }
      );

      results.push({
        email,
        tempPassword,
        status: "fixed",
      });

      console.log(`Fixed password for user: ${email}`);
    }

    res.status(200).json({
      success: true,
      message: `Fixed passwords for ${results.length} users`,
      results,
    });
  } catch (error: unknown) {
    console.error("Error fixing corrupted passwords:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fix corrupted passwords",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const setUserPasswordController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    if (process.env.NODE_ENV === "production") {
      res.status(403).json({
        success: false,
        message: "This endpoint is not available in production",
      });
      return;
    }

    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
      return;
    }

    const hashedPassword = await hashPassword(password);

    const user = await UserModel.findOneAndUpdate(
      {
        "account.email": email.toLowerCase(),
        "status.isDeleted": false,
      },
      {
        $set: {
          "account.password": hashedPassword,
          lastPasswordChange: new Date(),
        },
      },
      { new: true }
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Password set for user: ${email}`,
    });
  } catch (error: unknown) {
    console.error("Error setting user password:", error);
    res.status(500).json({
      success: false,
      message: "Failed to set user password",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};
