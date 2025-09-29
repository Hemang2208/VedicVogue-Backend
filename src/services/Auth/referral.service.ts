import UserModel, { IUser } from "../../models/Auth/user.model";
import { encrypt, decrypt } from "../../configs/crypto";
import mongoose from "mongoose";

export interface ReferralData {
  referralCode: string;
  referralId: string;
  referredBy?: {
    userId: string;
    fullname: string;
    referralCode: string;
    joinedAt: Date;
    rewardsClaimed: boolean;
    rewardsClaimedAt?: Date;
  };
  referrals: Array<{
    _id: string;
    userId: string;
    fullname: string;
    email: string;
    joinedAt: Date;
    status: string;
    rewardEarned: number;
    rewardClaimed: boolean;
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
    _id: string;
    type: string;
    amount: number;
    description: string;
    earnedAt: Date;
    claimed: boolean;
    claimedAt?: Date;
    expiresAt?: Date;
  }>;
  settings: {
    shareViaEmail: boolean;
    shareViaSMS: boolean;
    shareViaSocial: boolean;
    notifyOnReferralJoin: boolean;
    notifyOnRewardEarned: boolean;
  };
}

/**
 * Get user's referral data with encrypted IDs
 */
export const getUserReferralDataService = async (userId: string): Promise<ReferralData> => {
  try {
    const user = await UserModel.findById(userId)
      .populate({
        path: 'referral.referrals.userId',
        select: 'fullname account.email createdAt'
      })
      .populate({
        path: 'referral.referredBy.userId',
        select: 'fullname'
      })
      .lean();

    if (!user) {
      throw new Error("User not found");
    }

    // Encrypt sensitive IDs
    const encryptedReferralData: ReferralData = {
      referralCode: user.referral.referralCode,
      referralId: encrypt(user.referral.referralId),
      stats: user.referral.stats,
      settings: user.referral.settings,
      referrals: user.referral.referrals.map((referral: any) => ({
        _id: encrypt(referral._id.toString()),
        userId: encrypt(referral.userId._id.toString()),
        fullname: referral.userId.fullname,
        email: referral.userId.account.email,
        joinedAt: referral.joinedAt,
        status: referral.status,
        rewardEarned: referral.rewardEarned,
        rewardClaimed: referral.rewardClaimed,
        orderCompleted: referral.orderCompleted,
        firstOrderDate: referral.firstOrderDate,
      })),
      rewards: user.referral.rewards.map((reward: any) => ({
        _id: encrypt(reward._id.toString()),
        type: reward.type,
        amount: reward.amount,
        description: reward.description,
        earnedAt: reward.earnedAt,
        claimed: reward.claimed,
        claimedAt: reward.claimedAt,
        expiresAt: reward.expiresAt,
      })),
    };

    // Add referredBy info if exists
    if (user.referral.referredBy && user.referral.referredBy.userId) {
      encryptedReferralData.referredBy = {
        userId: encrypt(user.referral.referredBy.userId._id.toString()),
        fullname: (user.referral.referredBy.userId as any).fullname,
        referralCode: user.referral.referredBy.referralCode,
        joinedAt: user.referral.referredBy.joinedAt,
        rewardsClaimed: user.referral.referredBy.rewardsClaimed,
        rewardsClaimedAt: user.referral.referredBy.rewardsClaimedAt,
      };
    }

    return encryptedReferralData;
  } catch (error) {
    console.error("Error fetching referral data:", error);
    throw new Error("Failed to fetch referral data");
  }
};

/**
 * Process a new referral signup
 */
export const processReferralSignupService = async (
  newUserId: string,
  referralCode: string
): Promise<boolean> => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    // Find the referrer by referral code
    const referrer = await UserModel.findOne({ 
      "referral.referralCode": referralCode.toUpperCase() 
    }).session(session);

    if (!referrer) {
      await session.abortTransaction();
      return false;
    }

    // Get the new user
    const newUser = await UserModel.findById(newUserId).session(session);
    if (!newUser) {
      await session.abortTransaction();
      return false;
    }

    // Update referrer's referrals array
    referrer.referral.referrals.push({
      userId: new mongoose.Types.ObjectId(newUserId),
      referralCode: referralCode.toUpperCase(),
      joinedAt: new Date(),
      status: 'verified',
      rewardEarned: 50, // Base referral reward
      rewardClaimed: false,
      orderCompleted: false,
    });

    // Add reward to referrer
    referrer.referral.rewards.push({
      type: 'referral_bonus',
      amount: 50,
      description: `Referral bonus for inviting ${newUser.fullname}`,
      earnedAt: new Date(),
      claimed: false,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    });

    // Update new user's referredBy field
    newUser.referral.referredBy = {
      userId: referrer._id as mongoose.Types.ObjectId,
      referralCode: referralCode.toUpperCase(),
      joinedAt: new Date(),
      rewardsClaimed: false,
    };

    // Add signup bonus to new user
    newUser.referral.rewards.push({
      type: 'signup_bonus',
      amount: 25,
      description: 'Welcome bonus for joining via referral',
      earnedAt: new Date(),
      claimed: false,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    await referrer.save({ session });
    await newUser.save({ session });

    await session.commitTransaction();
    return true;
  } catch (error) {
    await session.abortTransaction();
    console.error("Error processing referral signup:", error);
    throw new Error("Failed to process referral signup");
  } finally {
    session.endSession();
  }
};

/**
 * Claim a specific reward
 */
export const claimRewardService = async (
  userId: string,
  encryptedRewardId: string
): Promise<boolean> => {
  try {
    const rewardId = decrypt(encryptedRewardId);
    
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const reward = user.referral.rewards.find(r => r._id?.toString() === rewardId);
    if (!reward) {
      throw new Error("Reward not found");
    }

    if (reward.claimed) {
      throw new Error("Reward already claimed");
    }

    if (reward.expiresAt && reward.expiresAt < new Date()) {
      throw new Error("Reward has expired");
    }

    reward.claimed = true;
    reward.claimedAt = new Date();

    // Add to loyalty points
    user.activity.loyaltyPoints += reward.amount;

    await user.save();
    return true;
  } catch (error) {
    console.error("Error claiming reward:", error);
    throw error;
  }
};

/**
 * Update referral settings
 */
export const updateReferralSettingsService = async (
  userId: string,
  settings: Partial<{
    shareViaEmail: boolean;
    shareViaSMS: boolean;
    shareViaSocial: boolean;
    notifyOnReferralJoin: boolean;
    notifyOnRewardEarned: boolean;
  }>
): Promise<boolean> => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Update settings
    Object.assign(user.referral.settings, settings);

    await user.save();
    return true;
  } catch (error) {
    console.error("Error updating referral settings:", error);
    throw new Error("Failed to update referral settings");
  }
};

/**
 * Validate referral code
 */
export const validateReferralCodeService = async (referralCode: string): Promise<{
  valid: boolean;
  referrerName?: string;
  bonus?: number;
}> => {
  try {
    const referrer = await UserModel.findOne({ 
      "referral.referralCode": referralCode.toUpperCase() 
    });

    if (!referrer || !referrer.status.isActive || referrer.status.isDeleted) {
      return { valid: false };
    }

    return {
      valid: true,
      referrerName: referrer.fullname,
      bonus: 25, // Signup bonus amount
    };
  } catch (error) {
    console.error("Error validating referral code:", error);
    return { valid: false };
  }
};

/**
 * Process first order completion for referral
 */
export const processReferralFirstOrderService = async (
  userId: string
): Promise<void> => {
  try {
    const user = await UserModel.findById(userId);
    if (!user || !user.referral.referredBy?.userId) {
      return; // User wasn't referred by anyone
    }

    // Find the referrer
    const referrer = await UserModel.findById(user.referral.referredBy.userId);
    if (!referrer) {
      return;
    }

    // Find the referral entry in referrer's referrals array
    const referralEntry = referrer.referral.referrals.find(
      ref => ref.userId.toString() === userId
    );

    if (referralEntry && !referralEntry.orderCompleted) {
      // Mark as completed and add bonus
      referralEntry.orderCompleted = true;
      referralEntry.firstOrderDate = new Date();
      referralEntry.status = 'completed';
      referralEntry.rewardEarned += 25; // Additional first order bonus

      // Add first order bonus to referrer
      referrer.referral.rewards.push({
        type: 'first_order_bonus',
        amount: 25,
        description: `First order bonus for ${user.fullname}'s first order`,
        earnedAt: new Date(),
        claimed: false,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      });

      await referrer.save();

      // Add first order bonus to referred user as well
      user.referral.rewards.push({
        type: 'first_order_bonus',
        amount: 25,
        description: 'First order completion bonus',
        earnedAt: new Date(),
        claimed: false,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });

      await user.save();
    }
  } catch (error) {
    console.error("Error processing referral first order:", error);
    // Don't throw error as this is a background process
  }
};
