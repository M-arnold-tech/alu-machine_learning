import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MarketPricesController } from './market-prices.controller';
import { MarketPricesService } from './market-prices.service';
import { MarketPrice } from './market-price.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MarketPrice]), ConfigModule],
  controllers: [MarketPricesController],
  providers: [MarketPricesService],
})
export class MarketPricesModule {}

