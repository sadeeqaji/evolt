import { FastifyInstance, RouteOptions } from "fastify";
import WaitlistController from "./waitlist.controller.js";
import { authenticateUser } from "../middleware/index.js";
import { JoinWaitlistSchema, GetWaitlistSchema } from "./waitlist.schema.js";
import { RouteMethods } from "../util/util.dto.js";

export default function waitlistRoutes(app: FastifyInstance) {
    const controller = new WaitlistController(app);

    const routes: RouteOptions[] = [
        {
            method: RouteMethods.POST,
            url: "/wait-list",
            handler: controller.joinWaitlist,
            schema: JoinWaitlistSchema
        },
        {
            method: RouteMethods.GET,
            url: "/wait-list",
            handler: controller.getWaitlist,
            preHandler: [authenticateUser],
            schema: GetWaitlistSchema
        }
    ];

    routes.forEach(route => app.route(route));
}
