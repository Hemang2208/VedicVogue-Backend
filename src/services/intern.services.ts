import InternModel, { IIntern } from "../models/intern.model";
import { Types, SortOrder } from "mongoose";

export const createInternService = async (
  internData: Partial<IIntern>
): Promise<IIntern> => {
  try {
    const intern = new InternModel(internData);
    return (await intern.save()) as IIntern;
  } catch (error: any) {
    throw new Error(`Failed to create intern: ${error.message}`);
  }
};

export const getInternByIdService = async (
  id: string
): Promise<IIntern | null> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid intern ID");
    }

    const intern = await InternModel.findOne({
      _id: id,
      isDeleted: false,
    });

    return intern as IIntern | null;
  } catch (error: any) {
    throw new Error(`Failed to fetch intern: ${error.message}`);
  }
};

export const updateInternStatusService = async (
  id: string,
  updates: Partial<IIntern>
): Promise<IIntern | null> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid intern ID");
    }

    const intern = await InternModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!intern) {
      throw new Error("Intern not found");
    }

    return intern as IIntern;
  } catch (error: any) {
    throw new Error(`Failed to update intern: ${error.message}`);
  }
};

export const deleteInternService = async (id: string): Promise<boolean> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid intern ID");
    }

    const result = await InternModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    );

    return !!result;
  } catch (error: any) {
    throw new Error(`Failed to delete intern: ${error.message}`);
  }
};

export const getAllInternsService = async (
  filter: any = {},
  page: number = 1,
  limit: number = 10,
  sortBy: string = "createdAt",
  sortOrder: "asc" | "desc" = "desc"
): Promise<{
  interns: any[];
  totalInterns: number;
  currentPage: number;
  totalPages: number;
}> => {
  try {
    const skip = (page - 1) * limit;
    const sort: Record<string, SortOrder> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const queryFilter = { ...filter, isDeleted: false };

    const interns = await InternModel.find(queryFilter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalInterns = await InternModel.countDocuments(queryFilter);
    const totalPages = Math.ceil(totalInterns / limit);

    return {
      interns,
      totalInterns,
      currentPage: page,
      totalPages,
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch interns: ${error.message}`);
  }
};

export const searchInternsService = async (
  searchTerm: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  interns: IIntern[];
  totalInterns: number;
  currentPage: number;
  totalPages: number;
}> => {
  try {
    const filter = {
      $or: [
        { fullName: { $regex: searchTerm, $options: "i" } },
        { "contactInfo.email": { $regex: searchTerm, $options: "i" } },
        { college: { $regex: searchTerm, $options: "i" } },
      ],
      isDeleted: false,
    };

    return await getAllInternsService(filter, page, limit);
  } catch (error: any) {
    throw new Error(`Failed to search interns: ${error.message}`);
  }
};

export const getInternStatistics = async (): Promise<{
  totalInterns: number;
  shortlistedApplications: number;
  repliedApplications: number;
  positionBreakdown: Array<{ position: string; count: number }>;
}> => {
  try {
    const totalInterns = await InternModel.countDocuments({
      isDeleted: false,
    });

    const shortlistedApplications = await InternModel.countDocuments({
      isShortlisted: true,
      isDeleted: false,
    });

    const repliedApplications = await InternModel.countDocuments({
      isReplied: true,
      isDeleted: false,
    });

    const positionBreakdown = await InternModel.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$position", count: { $sum: 1 } } },
      { $project: { position: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    return {
      totalInterns,
      shortlistedApplications,
      repliedApplications,
      positionBreakdown,
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch intern statistics: ${error.message}`);
  }
};
