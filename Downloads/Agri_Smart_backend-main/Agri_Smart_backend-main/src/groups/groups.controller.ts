import { Controller, Get, Post, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('Groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new group/cooperative' })
  create(@CurrentUser() user: User, @Body() body: { name: string; description?: string; district?: string }) {
    return this.groupsService.create(user.id, body);
  }

  @Get()
  @ApiOperation({ summary: 'List all groups, optionally filter by district' })
  @ApiQuery({ name: 'district', required: false })
  findAll(@CurrentUser() user: User, @Query('district') district?: string) {
    return this.groupsService.findAll(user.id, district);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a group with its members' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.groupsService.findOne(id, user.id);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join a group' })
  join(@Param('id') id: string, @CurrentUser() user: User) {
    return this.groupsService.join(id, user.id);
  }

  @Delete(':id/leave')
  @ApiOperation({ summary: 'Leave a group' })
  leave(@Param('id') id: string, @CurrentUser() user: User) {
    return this.groupsService.leave(id, user.id);
  }
}
