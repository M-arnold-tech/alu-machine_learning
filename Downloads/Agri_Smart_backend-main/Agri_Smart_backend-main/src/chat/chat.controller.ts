import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Get aggregated list of all private and group conversations (sidebar view)' })
  getConversations(@CurrentUser() user: User) {
    return this.chatService.getConversations(user.id);
  }

  @Get('users/search')
  @ApiOperation({ summary: 'Search for available users in the system to chat with' })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Search term for name or email' })
  searchUsers(
    @CurrentUser() user: User,
    @Query('q') query?: string,
  ) {
    return this.chatService.searchUsers(query || '', user.id);
  }

  @Post('send')
  @ApiOperation({ summary: 'Send a direct or group message (REST fallback)' })
  sendMessage(
    @CurrentUser() user: User,
    @Body() body: { content: string; receiverId?: string; groupId?: string },
  ) {
    return this.chatService.sendMessage(
      user.id,
      body.content,
      body.receiverId,
      body.groupId,
    );
  }

  @Get('history/:userId')
  @ApiOperation({ summary: "Get conversation history with another user" })
  getConversation(
    @CurrentUser() user: User,
    @Param('userId') otherUserId: string,
  ) {
    return this.chatService.getConversation(user.id, otherUserId);
  }

  @Get('group/:groupId')
  @ApiOperation({ summary: 'Get group chat history with pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  getGroupMessages(
    @Param('groupId') groupId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.chatService.getGroupMessages(groupId, limit, offset);
  }
}
