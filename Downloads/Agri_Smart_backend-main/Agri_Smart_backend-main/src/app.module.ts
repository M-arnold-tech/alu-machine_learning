import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { FarmerModule } from './farmer/farmer.module';
import { AdvisorModule } from './advisor/advisor.module';
import { ChatModule } from './chat/chat.module';
import { GroupsModule } from './groups/groups.module';
import { KnowledgeBaseModule } from './knowledge-base/knowledge-base.module';
import { CropCalendarModule } from './crop-calendar/crop-calendar.module';
import { WeatherModule } from './weather/weather.module';
import { MarketPricesModule } from './market-prices/market-prices.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    // Config — Load .env globally
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    DatabaseModule,

    // Mail (global)
    MailModule,

    // Feature Modules
    AuthModule,
    AdminModule,
    FarmerModule,
    AdvisorModule,
    ChatModule,
    GroupsModule,
    KnowledgeBaseModule,
    CropCalendarModule,
    WeatherModule,
    MarketPricesModule,
  ],
})
export class AppModule {}
