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
