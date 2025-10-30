import { FastifyInstance, RouteOptions } from "fastify";
import PaystackController from "./paystack.controller.js";
import { RouteMethods } from "../util/util.dto.js";

export default async function paystackRoutes(app: FastifyInstance) {
    const controller = new PaystackController(app);

    const routes: RouteOptions[] = [
        {
            method: RouteMethods.POST,
            url: "/webhook",
            handler: controller.webhook,
            config: {
                rawBody: true,
            },
        },
    ];

    routes.forEach((r) => app.route(r));
}