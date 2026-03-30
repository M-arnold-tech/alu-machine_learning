import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdvisorService } from './advisor.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('Advisor')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADVISOR)
@Controller('advisor')
export class AdvisorController {
  constructor(private readonly advisorService: AdvisorService) {}

  @Get('assigned-farmers')
  @ApiOperation({ summary: 'Get farmers assigned to this advisor' })
  getAssignedFarmers(@CurrentUser() user: User) {
    return this.advisorService.getAssignedFarmers(user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get advisor dashboard statistics' })
  getStats(@CurrentUser() user: User) {
    return this.advisorService.getAdvisorStats(user.id);
  }

  @Post('assign-farmer/:farmerId')
  @ApiOperation({ summary: 'Assign a farmer to this advisor' })
  assignFarmer(@Param('farmerId') farmerId: string, @CurrentUser() user: User) {
    return this.advisorService.assignFarmer(user.id, farmerId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update advisor profile (specialization, districts)' })
  updateProfile(@CurrentUser() user: User, @Body() body: any) {
    return this.advisorService.updateProfile(user.id, body);
  }
}
