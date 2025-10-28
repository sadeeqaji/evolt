import { FastifyInstance, RouteOptions } from "fastify";
import { RouteMethods } from "../util/util.dto.js";
import { WhatsAppController } from "./whatsapp.controller.js";

export default async function whatsappRoutes(app: FastifyInstance) {
    const controller = new WhatsAppController(app);

    const routes: RouteOptions[] = [
        {
            method: RouteMethods.GET,
            url: "/webhook",
            handler: controller.verifyWebhook,
        },
        {
            method: RouteMethods.POST,
            url: "/webhook",
            handler: controller.handleIncoming,
        },
        {
            method: RouteMethods.POST,
            url: "/whatsapp-flow",
            config: {
                rawBody: true,
            },
            handler: controller.handleFlowWebhook,
        },
    ];

    routes.forEach((r) => app.route(r));
}


