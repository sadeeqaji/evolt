import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import fastifyCookie from '@fastify/cookie';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import fastifySensible from '@fastify/sensible';
import fastifyMultipart from '@fastify/multipart';
import fastifyJwt from '@fastify/jwt';
import { websocketPlugin } from './websocket.plugin.js';
import fastifyWebsocket from '@fastify/websocket';
import fastifyRedis from '@fastify/redis';
import fastifyCors from '@fastify/cors';
import { indexRoute } from '../index.route.js';
import { errorHandlerPlugin } from '../config/error-handler.js';
import { Options } from '../config/swagger.js';
import { config } from '../config/app.js';

export async function corePlugin(
  app: FastifyInstance,
  opts: FastifyPluginOptions,
) {
  await app.register(fastifyCors, {
    origin: ['http://localhost:2020'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET || 'a-default-secret-change-it',
    hook: 'onRequest',
    parseOptions: {},
  });

  await app.register(fastifyMultipart, { attachFieldsToBody: true });
  app.register(fastifySensible);

  app.register(fastifySwagger, Options);
  app.register(fastifySwaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
  });

  app.register(fastifyWebsocket);
  app.register(websocketPlugin);

  app.register(fastifyJwt, config.jwt);

  app.register(fastifyRedis, {
    url: process.env.UPSTASH_REDIS_URL,
    family: 0,
    enableReadyCheck: true,
  });

  app.ready(async () => {
    try {
      const pong = await app.redis.ping();
      console.log('✅ Redis connected successfully:', pong);
    } catch (err) {
      console.error('❌ Redis connection failed:', err);
    }
  });

  app.register(errorHandlerPlugin);

  indexRoute(app);

  try {
    await mongoose.connect(process.env.DATABASE_URL!, {});
    app.log.info('MongoDB connected...');
  } catch (err: any) {
    console.log(err, 'error');
    app.log.error('MongoDB connection failed:', err);
  }
}
