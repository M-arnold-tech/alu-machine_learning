import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FarmerService } from './farmer.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('Farmer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.FARMER)
@Controller('farmer')
export class FarmerController {
  constructor(private readonly farmerService: FarmerService) {}

  @Get('my-stats')
  @ApiOperation({ summary: 'Get farmer dashboard statistics' })
  getMyStats(@CurrentUser() user: User) {
    return this.farmerService.getMyStats(user.id);
  }

  @Get('my-advisor')
  @ApiOperation({ summary: 'Get assigned advisor details' })
  getMyAdvisor(@CurrentUser() user: User) {
    return this.farmerService.getMyAdvisor(user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update farm profile (land size, crops, location)' })
  updateProfile(@CurrentUser() user: User, @Body() body: any) {
    return this.farmerService.updateProfile(user.id, body);
  }

  @Get('directory')
  @ApiOperation({ summary: 'Get a list of all active farmers and advisors to start chats with' })
  getDirectory(@CurrentUser() user: User) {
    return this.farmerService.getDirectory(user.id);
  }
}
