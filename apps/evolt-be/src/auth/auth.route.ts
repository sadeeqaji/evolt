import { FastifyInstance, RouteOptions } from 'fastify';
import AuthController from './auth.controller.js';
import {
  SendOtpSchema,
  SignupSchema,
  VerifyOtpSchema,
  SetPasswordSchema,
  LoginSchema,
  InvestorNonceSchema,
  InvestorVerifySignatureSchema,
  AdminLogoutSchema,
  RefreshTokenSchema,
  LogoutSchema,
} from './auth.schema.js';
import { RouteMethods } from '../util/util.dto.js';
import { authenticateAdmin, authenticateUser } from '../middleware/index.js';
import { validatePasswordsMatch } from './auth.middleware.js';

export default function authRoutes(app: FastifyInstance) {
  const controller = new AuthController(app);

  const routes: RouteOptions[] = [
    {
      method: RouteMethods.POST,
      url: '/send-otp',
      handler: controller.sendOtp,
      schema: SendOtpSchema,
    },
    {
      method: RouteMethods.POST,
      url: '/signup',
      schema: SignupSchema,
      preHandler: [validatePasswordsMatch],
      handler: controller.signup,
    },
    {
      method: RouteMethods.POST,
      url: '/verify-otp',
      handler: controller.verifyOtp,
      schema: VerifyOtpSchema,
    },
    {
      method: RouteMethods.POST,
      url: '/set-password',
      handler: controller.setPassword,
      preHandler: [authenticateUser],
      schema: SetPasswordSchema,
    },
    {
      method: RouteMethods.POST,
      url: '/login',
      handler: controller.login,
      schema: LoginSchema,
    },
    {
      method: 'GET',
      url: '/nonce',
      schema: InvestorNonceSchema,
      handler: controller.getChallenge,
    },
    {
      method: 'POST',
      url: '/verify-signature',
      schema: InvestorVerifySignatureSchema,
      handler: controller.verifySignature,
    },

    {
      method: RouteMethods.POST,
      url: '/logout',
      preHandler: [authenticateUser, authenticateAdmin],
      handler: controller.adminLogout,
      schema: AdminLogoutSchema,
    },

    // { method: RouteMethods.POST, url: "/auth/refresh", handler: ctrl.refresh, schema: RefreshTokenSchema },
    // { method: RouteMethods.POST, url: "/auth/logout", handler: ctrl.logout, schema: LogoutSchema },
  ];

  routes.forEach((route) => app.route(route));
}
