import { Request, Response } from "express";
import {
  createApplicationService,
  getApplicationByIdService,
  updateApplicationStatusService,
  deleteApplicationService,
  getAllApplicationsService,
  getApplicationsByPositionService,
  getShortlistedApplicationsService,
  getRepliedApplicationsService,
  searchApplicationsService,
  getApplicationStatistics,
} from "../../services/Application/application.service";
import { IApplication } from "../../models/Application/application.model";
import { decrypt, encrypt } from "../../configs/crypto";

export const createApplicationController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { data } = req.body;
    const decryptedData = JSON.parse(decrypt(data));

    const ipAddress: string | undefined =
      req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() ||
      req.socket?.remoteAddress ||
      req.connection?.remoteAddress ||
      "UNKNOWN";

    const finalData: Partial<IApplication> = {
      ...decryptedData,
      ipAddress: ipAddress,
    };

    const newApplication = await createApplicationService(finalData);

    const responseData = {
      fullName: newApplication.fullName,
      position: newApplication.position,
      submittedAt: new Date().toISOString(),
    };
    const encryptedData = encrypt(JSON.stringify(responseData));

    res.status(201).json({
      success: true,
      message: "Application Submitted Successfully",
      data: encryptedData,
    });
  } catch (error: unknown) {
    console.log("Error creating application:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit application",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const getApplicationByIdController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { id } = req.params;
    const application = await getApplicationByIdService(id);

    if (!application) {
      res.status(404).json({
        success: false,
        message: "Application not found",
      });
      return;
    }

    const encryptedData = encrypt(JSON.stringify(application));

    res.status(200).json({
      success: true,
      data: encryptedData,
    });
  } catch (error: unknown) {
    console.log("Error fetching application:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch application",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const updateApplicationStatusController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isReplied, isShortlisted } = req.body;

    const updatedApplication = await updateApplicationStatusService(id, {
      isReplied,
      isShortlisted,
    });

    const encryptedData = encrypt(JSON.stringify(updatedApplication));

    res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      data: encryptedData,
    });
  } catch (error: unknown) {
    console.log("Error updating application status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update application status",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const deleteApplicationController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { id } = req.params;
    const isDeleted = await deleteApplicationService(id);

    if (!isDeleted) {
      res.status(404).json({
        success: false,
        message: "Application not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error: unknown) {
    console.log("Error deleting application:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete application",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const getAllApplicationsController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    // Add CORS headers explicitly (backup to middleware)
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Credentials", "true");

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

    const result = await getAllApplicationsService(
      {},
      page,
      limit,
      sortBy,
      sortOrder
    );

    // Encrypt data safely
    let encryptedData: string;
    let encryptedData2: string;

    try {
      encryptedData = encrypt(JSON.stringify(result.applications || []));

      const paginationData = {
        totalApplications: result.totalApplications || 0,
        currentPage: result.currentPage || 1,
        totalPages: result.totalPages || 0,
      };

      encryptedData2 = encrypt(JSON.stringify(paginationData));
    } catch (encryptError) {
      console.error("Encryption error:", encryptError);
      encryptedData = JSON.stringify(result.applications || []);
      encryptedData2 = JSON.stringify({
        totalApplications: result.totalApplications || 0,
        currentPage: result.currentPage || 1,
        totalPages: result.totalPages || 0,
      });
    }

    const responseData = {
      success: true,
      data: encryptedData,
      pagination: encryptedData2,
    };

    res.status(200).json(responseData);
  } catch (error: unknown) {
    console.error("Error fetching applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const getApplicationsByPositionController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { position } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getApplicationsByPositionService(
      position,
      page,
      limit
    );

    const encryptedData = encrypt(JSON.stringify(result.applications));

    const paginationData = {
      totalApplications: result.totalApplications,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
    };

    const encryptedData2 = encrypt(JSON.stringify(paginationData));

    res.status(200).json({
      success: true,
      data: encryptedData,
      pagination: encryptedData2,
    });
  } catch (error: unknown) {
    console.log("Error fetching applications by position:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications by position",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const getShortlistedApplicationsController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getShortlistedApplicationsService(page, limit);

    const encryptedData = encrypt(JSON.stringify(result.applications));

    const paginationData = {
      totalApplications: result.totalApplications,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
    };

    const encryptedData2 = encrypt(JSON.stringify(paginationData));

    res.status(200).json({
      success: true,
      data: encryptedData,
      pagination: encryptedData2,
    });
  } catch (error: unknown) {
    console.log("Error fetching shortlisted applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch shortlisted applications",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const getRepliedApplicationsController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getRepliedApplicationsService(page, limit);

    const encryptedData = encrypt(JSON.stringify(result.applications));

    const paginationData = {
      totalApplications: result.totalApplications,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
    };

    const encryptedData2 = encrypt(JSON.stringify(paginationData));

    res.status(200).json({
      success: true,
      data: encryptedData,
      pagination: encryptedData2,
    });
  } catch (error: unknown) {
    console.log("Error fetching replied applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch replied applications",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const searchApplicationsController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { searchTerm } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!searchTerm || typeof searchTerm !== "string") {
      res.status(400).json({
        success: false,
        message: "Search term is required",
      });
      return;
    }

    const result = await searchApplicationsService(searchTerm, page, limit);

    const encryptedData = encrypt(JSON.stringify(result.applications));

    const paginationData = {
      totalApplications: result.totalApplications,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
    };

    const encryptedData2 = encrypt(JSON.stringify(paginationData));

    res.status(200).json({
      success: true,
      data: encryptedData,
      pagination: encryptedData2,
    });
  } catch (error: unknown) {
    console.log("Error searching applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search applications",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const getApplicationStatisticsController = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const statistics = await getApplicationStatistics();

    const encryptedData = encrypt(JSON.stringify(statistics));

    res.status(200).json({
      success: true,
      data: encryptedData,
    });
  } catch (error: unknown) {
    console.log("Error fetching application statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch application statistics",
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};
