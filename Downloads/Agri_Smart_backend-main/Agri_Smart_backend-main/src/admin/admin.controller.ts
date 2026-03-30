import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get platform-wide statistics' })
  getPlatformStats() {
    return this.adminService.getPlatformStats();
  }

  @Get('advisors/pending')
  @ApiOperation({ summary: 'List advisors awaiting approval' })
  getPendingAdvisors() {
    return this.adminService.getPendingAdvisors();
  }

  @Patch('approve-advisor/:id')
  @ApiOperation({ summary: 'Approve an advisor account and send welcome email' })
  approveAdvisor(
    @Param('id') advisorId: string,
    @CurrentUser() admin: User,
  ) {
    return this.adminService.approveAdvisor(advisorId, admin.id);
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users, optionally filtered by role' })
  @ApiQuery({ name: 'role', enum: UserRole, required: false })
  getAllUsers(@Query('role') role?: string) {
    return this.adminService.getAllUsers(role);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Deactivate a user account' })
  deactivateUser(@Param('id') userId: string, @CurrentUser() admin: User) {
    return this.adminService.deactivateUser(userId, admin.id);
  }
}
