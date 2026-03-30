import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const port = config.get<number>('port') || 3000;
  const frontendUrl = config.get<string>('frontendUrl') || 'http://localhost:3001';

  // ─── Security: Helmet with Content Security Policy ─────────────────────────
  app.use(
    (helmet as any).default({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", 'https:'],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", 'https:'],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // ─── CORS ──────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
    credentials: true,
  });

  // ─── Global Pipes ──────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ─── Global Filters & Interceptors ─────────────────────────────────────────
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  // ─── API Prefix ────────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1', { exclude: ['/'] });

  // ─── Swagger Documentation ─────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('🌱 AgriSmart API')
    .setDescription(
      `
**AgriSmart** — Rwanda's Agricultural Advisory Platform

Connecting farmers with certified agricultural advisors to increase yields and improve livelihoods.

## Authentication
Use the **Authorize** button to add your JWT Bearer token.
All protected endpoints require: \`Authorization: Bearer <token>\`

## Roles
- **ADMIN** — Platform management, advisor approval
- **ADVISOR** — Farm guidance, knowledge base, crop calendars
- **FARMER** — Dashboard, messaging, market prices

## WebSocket (Real-time Chat)
Connect to \`ws://localhost:${port}/chat\` for real-time messaging.
Events: \`sendMessage\`, \`receiveMessage\`, \`joinRoom\`, \`leaveRoom\`, \`typing\`
      `,
    )
    .setVersion('1.0')
    .setContact('AgriSmart Team', 'https://agrismart.rw', 'support@agrismart.rw')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth()
    .addTag('Auth', 'Registration, login, and profile endpoints')
    .addTag('Admin', 'Admin-only platform management')
    .addTag('Farmer', 'Farmer dashboard and farm management')
    .addTag('Advisor', 'Advisor dashboard and farmer management')
    .addTag('Chat', 'Messaging (REST + WebSocket)')
    .addTag('Groups', 'Farmer cooperatives and regional clusters')
    .addTag('Knowledge Base', 'Resources, guides, and documents')
    .addTag('Crop Calendar', 'Task notifications and crop schedules')
    .addTag('Weather', 'Rwanda district weather data')
    .addTag('Market Prices', 'Crop market prices')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'AgriSmart API Docs',
    customCss: `
      .swagger-ui .topbar { background: linear-gradient(135deg, #2d6a4f, #40916c); }
      .swagger-ui .topbar-wrapper img { content: url(''); }
      .swagger-ui .topbar-wrapper::before { content: '🌱 AgriSmart API'; color: white; font-size: 20px; font-weight: bold; }
    `,
  });

  await app.listen(port);
  console.log(`
  🌱 ─────────────────────────────────────────────
     AgriSmart API is running!
  ─────────────────────────────────────────────────
     🚀  App:     http://localhost:${port}/api/v1
     📚  Docs:    http://localhost:${port}/api/docs
     🌍  Env:     ${config.get('nodeEnv')}
  ─────────────────────────────────────────────────
  `);
}
bootstrap();
