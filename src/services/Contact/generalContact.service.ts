import GeneralContactModel, { IGeneralContact } from "../../models/Contact/generalContact.model";
import { Types, SortOrder } from "mongoose";

export const createGeneralContactService = async (
  contactData: Partial<IGeneralContact>
): Promise<IGeneralContact> => {
  try {
    const contact = new GeneralContactModel(contactData);
    return (await contact.save()) as IGeneralContact;
  } catch (error: any) {
    throw new Error(`Failed to create contact: ${error.message}`);
  }
};

export const getGeneralContactByIdService = async (
  id: string
): Promise<IGeneralContact | null> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid contact ID");
    }

    const contact = await GeneralContactModel.findOne({
      _id: id,
      isDeleted: false
    });

    return contact as IGeneralContact | null;
  } catch (error: any) {
    throw new Error(`Failed to fetch contact: ${error.message}`);
  }
};

export const updateGeneralContactStatusService = async (
  id: string,
  updates: {
    status?: "pending" | "in-progress" | "resolved" | "closed";
    assignedTo?: string;
    responseNotes?: string;
    customerSatisfactionRating?: number;
    followUpRequired?: boolean;
  }
): Promise<IGeneralContact | null> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid contact ID");
    }

    // If status is being updated to resolved, set resolvedAt
    if (updates.status === "resolved") {
      (updates as any).resolvedAt = new Date();
    }

    const contact = await GeneralContactModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!contact) {
      throw new Error("Contact not found");
    }

    return contact as IGeneralContact;
  } catch (error: any) {
    throw new Error(`Failed to update contact: ${error.message}`);
  }
};

export const deleteGeneralContactService = async (id: string): Promise<boolean> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid contact ID");
    }

    const result = await GeneralContactModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { 
        $set: { 
          isDeleted: true,
          deletedAt: new Date()
        } 
      },
      { new: true }
    );

    return !!result;
  } catch (error: any) {
    throw new Error(`Failed to delete contact: ${error.message}`);
  }
};

export const getAllGeneralContactsService = async (
  filter: any = {},
  page: number = 1,
  limit: number = 10,
  sortBy: string = "createdAt",
  sortOrder: "asc" | "desc" = "desc"
): Promise<{
  contacts: any[];
  totalContacts: number;
  currentPage: number;
  totalPages: number;
}> => {
  try {
    const skip = (page - 1) * limit;
    const sort: Record<string, SortOrder> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const queryFilter = { ...filter, isDeleted: false };

    const contacts = await GeneralContactModel.find(queryFilter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalContacts = await GeneralContactModel.countDocuments(queryFilter);
    const totalPages = Math.ceil(totalContacts / limit);

    return {
      contacts,
      totalContacts,
      currentPage: page,
      totalPages,
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch contacts: ${error.message}`);
  }
};

export const getContactsByStatusService = async (
  status: "pending" | "in-progress" | "resolved" | "closed",
  page: number = 1,
  limit: number = 10
): Promise<{
  contacts: any[];
  totalContacts: number;
  currentPage: number;
  totalPages: number;
}> => {
  try {
    const filter = { status };

    return await getAllGeneralContactsService(filter, page, limit);
  } catch (error: any) {
    throw new Error(`Failed to fetch contacts by status: ${error.message}`);
  }
};

export const getContactsByPriorityService = async (
  priority: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  contacts: any[];
  totalContacts: number;
  currentPage: number;
  totalPages: number;
}> => {
  try {
    const filter = { priority };
    return await getAllGeneralContactsService(filter, page, limit);
  } catch (error: any) {
    throw new Error(`Failed to fetch contacts by priority: ${error.message}`);
  }
};

export const getContactsByIssueTypeService = async (
  issueType: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  contacts: any[];
  totalContacts: number;
  currentPage: number;
  totalPages: number;
}> => {
  try {
    const filter = {
      issueType: { $regex: issueType, $options: "i" },
    };

    return await getAllGeneralContactsService(filter, page, limit);
  } catch (error: any) {
    throw new Error(
      `Failed to fetch contacts by issue type: ${error.message}`
    );
  }
};

export const getPendingContactsService = async (
  page: number = 1,
  limit: number = 10
): Promise<{
  contacts: any[];
  totalContacts: number;
  currentPage: number;
  totalPages: number;
}> => {
  try {
    const filter = { status: "pending" };
    return await getAllGeneralContactsService(filter, page, limit);
  } catch (error: any) {
    throw new Error(`Failed to fetch pending contacts: ${error.message}`);
  }
};

export const getResolvedContactsService = async (
  page: number = 1,
  limit: number = 10
): Promise<{
  contacts: any[];
  totalContacts: number;
  currentPage: number;
  totalPages: number;
}> => {
  try {
    const filter = { status: "resolved" };
    return await getAllGeneralContactsService(filter, page, limit);
  } catch (error: any) {
    throw new Error(`Failed to fetch resolved contacts: ${error.message}`);
  }
};

export const getAssignedContactsService = async (
  assignedTo: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  contacts: any[];
  totalContacts: number;
  currentPage: number;
  totalPages: number;
}> => {
  try {
    const filter = { assignedTo };
    return await getAllGeneralContactsService(filter, page, limit);
  } catch (error: any) {
    throw new Error(`Failed to fetch assigned contacts: ${error.message}`);
  }
};

export const searchGeneralContactsService = async (
  searchTerm: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  contacts: IGeneralContact[];
  totalContacts: number;
  currentPage: number;
  totalPages: number;
}> => {
  try {
    const filter = {
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
        { subject: { $regex: searchTerm, $options: "i" } },
        { issueType: { $regex: searchTerm, $options: "i" } },
        { message: { $regex: searchTerm, $options: "i" } },
      ],
    };

    return await getAllGeneralContactsService(filter, page, limit);
  } catch (error: any) {
    throw new Error(`Failed to search contacts: ${error.message}`);
  }
};

export const assignContactToAgentService = async (
  contactId: string,
  agentName: string
): Promise<IGeneralContact | null> => {
  try {
    if (!Types.ObjectId.isValid(contactId)) {
      throw new Error("Invalid contact ID");
    }

    const updates: any = { assignedTo: agentName };
    
    // If contact is pending, change status to in-progress
    const contact = await GeneralContactModel.findOne({
      _id: contactId,
      isDeleted: false
    });
    if (contact && contact.status === "pending") {
      updates.status = "in-progress";
    }

    return await updateGeneralContactStatusService(contactId, updates);
  } catch (error: any) {
    throw new Error(`Failed to assign contact to agent: ${error.message}`);
  }
};

export const markContactAsResolvedService = async (
  contactId: string,
  responseNotes?: string
): Promise<IGeneralContact | null> => {
  try {
    const updates: any = { 
      status: "resolved",
      resolvedAt: new Date()
    };
    
    if (responseNotes) {
      updates.responseNotes = responseNotes;
    }

    return await updateGeneralContactStatusService(contactId, updates);
  } catch (error: any) {
    throw new Error(`Failed to mark contact as resolved: ${error.message}`);
  }
};

export const getGeneralContactStatistics = async (): Promise<{
  totalContacts: number;
  pendingContacts: number;
  inProgressContacts: number;
  resolvedContacts: number;
  closedContacts: number;
  priorityBreakdown: Array<{ priority: string; count: number }>;
  issueTypeBreakdown: Array<{ issueType: string; count: number }>;
  averageResolutionTime: number; // in hours
}> => {
  try {
    const totalContacts = await GeneralContactModel.countDocuments({
      isDeleted: false
    });
    const pendingContacts = await GeneralContactModel.countDocuments({
      status: "pending",
      isDeleted: false
    });
    const inProgressContacts = await GeneralContactModel.countDocuments({
      status: "in-progress",
      isDeleted: false
    });
    const resolvedContacts = await GeneralContactModel.countDocuments({
      status: "resolved",
      isDeleted: false
    });
    const closedContacts = await GeneralContactModel.countDocuments({
      status: "closed",
      isDeleted: false
    });

    const priorityBreakdown = await GeneralContactModel.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
      { $project: { priority: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    const issueTypeBreakdown = await GeneralContactModel.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$issueType", count: { $sum: 1 } } },
      { $project: { issueType: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    // Calculate average resolution time for resolved contacts
    const resolutionTimeData = await GeneralContactModel.aggregate([
      {
        $match: { 
          status: "resolved", 
          resolvedAt: { $exists: true },
          isDeleted: false
        }
      },
      {
        $project: {
          resolutionTime: {
            $divide: [
              { $subtract: ["$resolvedAt", "$createdAt"] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          averageTime: { $avg: "$resolutionTime" }
        }
      }
    ]);

    const averageResolutionTime = resolutionTimeData[0]?.averageTime || 0;

    return {
      totalContacts,
      pendingContacts,
      inProgressContacts,
      resolvedContacts,
      closedContacts,
      priorityBreakdown,
      issueTypeBreakdown,
      averageResolutionTime: Math.round(averageResolutionTime * 100) / 100, // Round to 2 decimal places
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch contact statistics: ${error.message}`);
  }
};

// Additional services for managing deleted contacts
export const getAllDeletedContactsService = async (
  page: number = 1,
  limit: number = 10,
  sortBy: string = "deletedAt",
  sortOrder: "asc" | "desc" = "desc"
): Promise<{
  contacts: any[];
  totalContacts: number;
  currentPage: number;
  totalPages: number;
}> => {
  try {
    const skip = (page - 1) * limit;
    const sort: Record<string, SortOrder> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const filter = { isDeleted: true };

    const contacts = await GeneralContactModel.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalContacts = await GeneralContactModel.countDocuments(filter);
    const totalPages = Math.ceil(totalContacts / limit);

    return {
      contacts,
      totalContacts,
      currentPage: page,
      totalPages,
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch deleted contacts: ${error.message}`);
  }
};

export const restoreGeneralContactService = async (id: string): Promise<IGeneralContact | null> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid contact ID");
    }

    const contact = await GeneralContactModel.findOneAndUpdate(
      { _id: id, isDeleted: true },
      { 
        $unset: { 
          deletedAt: 1
        },
        $set: {
          isDeleted: false
        }
      },
      { new: true, runValidators: true }
    );

    if (!contact) {
      throw new Error("Deleted contact not found");
    }

    return contact as IGeneralContact;
  } catch (error: any) {
    throw new Error(`Failed to restore contact: ${error.message}`);
  }
};

export const permanentlyDeleteContactService = async (id: string): Promise<boolean> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid contact ID");
    }

    const result = await GeneralContactModel.findOneAndDelete({
      _id: id,
      isDeleted: true
    });

    return !!result;
  } catch (error: any) {
    throw new Error(`Failed to permanently delete contact: ${error.message}`);
  }
};

export const bulkDeleteContactsService = async (ids: string[]): Promise<number> => {
  try {
    const validIds = ids.filter(id => Types.ObjectId.isValid(id));
    
    if (validIds.length === 0) {
      throw new Error("No valid contact IDs provided");
    }

    const result = await GeneralContactModel.updateMany(
      { 
        _id: { $in: validIds },
        isDeleted: false 
      },
      { 
        $set: { 
          isDeleted: true,
          deletedAt: new Date()
        } 
      }
    );

    return result.modifiedCount;
  } catch (error: any) {
    throw new Error(`Failed to bulk delete contacts: ${error.message}`);
  }
};

export const bulkRestoreContactsService = async (ids: string[]): Promise<number> => {
  try {
    const validIds = ids.filter(id => Types.ObjectId.isValid(id));
    
    if (validIds.length === 0) {
      throw new Error("No valid contact IDs provided");
    }

    const result = await GeneralContactModel.updateMany(
      { 
        _id: { $in: validIds },
        isDeleted: true 
      },
      { 
        $unset: { deletedAt: 1 },
        $set: { isDeleted: false }
      }
    );

    return result.modifiedCount;
  } catch (error: any) {
    throw new Error(`Failed to bulk restore contacts: ${error.message}`);
  }
};
