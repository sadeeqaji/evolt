import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import WaitlistService from "./waitlist.service.js";
import UtilService from "../util/util.service.js";

class WaitlistController {
    constructor(private app: FastifyInstance) { }


    joinWaitlist = async (req: FastifyRequest, reply: FastifyReply) => {
        const data = req.body as any;
        const created = await WaitlistService.addToWaitlist(data);
        reply
            .status(201)
            .send(UtilService.customResponse(true, "Joined waitlist", created));
    };


    getWaitlist = async (_req: FastifyRequest, reply: FastifyReply) => {
        const entries = await WaitlistService.fetchAll();
        reply
            .status(200)
            .send(UtilService.customResponse(true, "Waitlist fetched", entries));
    };
}

export default WaitlistController;
