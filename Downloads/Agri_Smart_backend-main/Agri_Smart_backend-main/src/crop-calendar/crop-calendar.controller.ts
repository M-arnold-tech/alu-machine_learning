import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CropCalendarService } from './crop-calendar.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('Crop Calendar')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('crop-calendar')
export class CropCalendarController {
  constructor(private readonly service: CropCalendarService) {}

  @Post('task')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADVISOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a crop task notification for a district' })
  createTask(@CurrentUser() user: User, @Body() body: any) {
    return this.service.createTask(user.id, body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all crop calendar tasks' })
  getAll() {
    return this.service.getAll();
  }

  @Get(':district')
  @ApiOperation({ summary: 'Get crop tasks for a specific district' })
  getByDistrict(@Param('district') district: string) {
    return this.service.getByDistrict(district);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADVISOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a crop task' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.updateTask(id, body);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADVISOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a crop task' })
  remove(@Param('id') id: string) {
    return this.service.removeTask(id);
  }
}
