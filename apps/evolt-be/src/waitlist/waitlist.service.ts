import { WaitlistModel, IWaitlistEntry } from "./waitlist.model.js";
import { FilterQuery } from "mongoose";

class WaitlistService {
    async addToWaitlist(data: Partial<IWaitlistEntry>): Promise<IWaitlistEntry> {
        const entry = new WaitlistModel(data);
        return entry.save();
    }

    async fetchAll(query: FilterQuery<IWaitlistEntry> = {}): Promise<IWaitlistEntry[]> {
        return WaitlistModel.find(query).sort({ createdAt: -1 });
    }
}

export default new WaitlistService();
