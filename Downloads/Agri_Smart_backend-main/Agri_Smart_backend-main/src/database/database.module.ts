import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.username'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.name'),
        ssl: config.get<boolean>('database.ssl')
          ? { rejectUnauthorized: false }
          : false,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: config.get<string>('nodeEnv') === 'development',
        autoLoadEntities: true,
        // Faster failure in tests if DB is down
        retryAttempts: config.get<string>('nodeEnv') === 'test' ? 1 : 10,
        retryDelay: config.get<string>('nodeEnv') === 'test' ? 0 : 3000,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
