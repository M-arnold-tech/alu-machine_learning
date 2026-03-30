import { Controller, Get, Post, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MarketPricesService } from './market-prices.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';

@ApiTags('Market Prices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('market-prices')
export class MarketPricesController {
  constructor(private readonly service: MarketPricesService) {}

  @Get()
  @ApiOperation({ summary: 'Get current crop market prices' })
  getAll() {
    return this.service.getAll();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create or update a market price (Admin only)' })
  upsertPrice(@Body() body: any) {
    return this.service.upsertPrice(body);
  }
}
