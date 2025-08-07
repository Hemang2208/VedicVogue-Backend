import ApplicationModel, { IApplication } from "../../models/Application/application.model";
import { Types, SortOrder } from "mongoose";

export const createApplicationService = async (
  applicationData: Partial<IApplication>
): Promise<IApplication> => {
  try {
    const application = new ApplicationModel(applicationData);
    return (await application.save()) as IApplication;
  } catch (error: any) {
    throw new Error(`Failed to create application: ${error.message}`);
  }
};

export const getApplicationByIdService = async (
  id: string
): Promise<IApplication | null> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid application ID");
    }

    const application = await ApplicationModel.findOne({
      _id: id,
      isDeleted: false,
    });

    return application as IApplication | null;
  } catch (error: any) {
    throw new Error(`Failed to fetch application: ${error.message}`);
  }
};

export const updateApplicationStatusService = async (
  id: string,
  updates: {
    isReplied?: boolean;
    isShortlisted?: boolean;
  }
): Promise<IApplication | null> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid application ID");
    }

    const application = await ApplicationModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!application) {
      throw new Error("Application not found");
    }

    return application as IApplication;
  } catch (error: any) {
    throw new Error(`Failed to update application: ${error.message}`);
  }
};

export const deleteApplicationService = async (id: string): Promise<boolean> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid application ID");
    }

    const result = await ApplicationModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    );

    return !!result;
  } catch (error: any) {
    throw new Error(`Failed to delete application: ${error.message}`);
  }
};

export const getAllApplicationsService = async (
  filter: any = {},
  page: number = 1,
  limit: number = 10,
  sortBy: string = "createdAt",
  sortOrder: "asc" | "desc" = "desc"
): Promise<{
  applications: any[];
  totalApplications: number;
  currentPage: number;
  totalPages: number;
}> => {
  try {
    const skip = (page - 1) * limit;
    const sort: Record<string, SortOrder> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const queryFilter = { ...filter, isDeleted: false };

    const applications = await ApplicationModel.find(queryFilter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalApplications = await ApplicationModel.countDocuments(
      queryFilter
    );
    const totalPages = Math.ceil(totalApplications / limit);

    return {
      applications,
      totalApplications,
      currentPage: page,
      totalPages,
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch applications: ${error.message}`);
  }
};

export const getApplicationsByPositionService = async (
  position: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  applications: any[];
  totalApplications: number;
  currentPage: number;
  totalPages: number;
}> => {
  try {
    const filter = {
      position: { $regex: position, $options: "i" },
      isDeleted: false,
    };

    return await getAllApplicationsService(filter, page, limit);
  } catch (error: any) {
    throw new Error(
      `Failed to fetch applications by position: ${error.message}`
    );
  }
};

export const getShortlistedApplicationsService = async (
  page: number = 1,
  limit: number = 10
): Promise<{
  applications: any[];
  totalApplications: number;
  currentPage: number;
  totalPages: number;
}> => {
  try {
    const filter = { isShortlisted: true, isDeleted: false };
    return await getAllApplicationsService(filter, page, limit);
  } catch (error: any) {
    throw new Error(
      `Failed to fetch shortlisted applications: ${error.message}`
    );
  }
};

export const getRepliedApplicationsService = async (
  page: number = 1,
  limit: number = 10
): Promise<{
  applications: any[];
  totalApplications: number;
  currentPage: number;
  totalPages: number;
}> => {
  try {
    const filter = { isReplied: true, isDeleted: false };
    return await getAllApplicationsService(filter, page, limit);
  } catch (error: any) {
    throw new Error(`Failed to fetch replied applications: ${error.message}`);
  }
};

export const searchApplicationsService = async (
  searchTerm: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  applications: IApplication[];
  totalApplications: number;
  currentPage: number;
  totalPages: number;
}> => {
  try {
    const filter = {
      $or: [
        { fullName: { $regex: searchTerm, $options: "i" } },
        { "contactInfo.email": { $regex: searchTerm, $options: "i" } },
        { position: { $regex: searchTerm, $options: "i" } },
        { "information.position": { $regex: searchTerm, $options: "i" } },
      ],
      isDeleted: false,
    };

    return await getAllApplicationsService(filter, page, limit);
  } catch (error: any) {
    throw new Error(`Failed to search applications: ${error.message}`);
  }
};

export const getApplicationStatistics = async (): Promise<{
  totalApplications: number;
  shortlistedApplications: number;
  repliedApplications: number;
  pendingApplications: number;
  positionBreakdown: Array<{ position: string; count: number }>;
}> => {
  try {
    const totalApplications = await ApplicationModel.countDocuments({
      isDeleted: false,
    });
    const shortlistedApplications = await ApplicationModel.countDocuments({
      isShortlisted: true,
      isDeleted: false,
    });
    const repliedApplications = await ApplicationModel.countDocuments({
      isReplied: true,
      isDeleted: false,
    });
    const pendingApplications = await ApplicationModel.countDocuments({
      isReplied: false,
      isShortlisted: false,
      isDeleted: false,
    });

    const positionBreakdown = await ApplicationModel.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$position", count: { $sum: 1 } } },
      { $project: { position: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    return {
      totalApplications,
      shortlistedApplications,
      repliedApplications,
      pendingApplications,
      positionBreakdown,
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch application statistics: ${error.message}`);
  }
};
