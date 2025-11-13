import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  create(@Request() req, @Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(req.user.userId, createMessageDto);
  }

  @Get('conversations')
  findConversations(@Request() req) {
    return this.messagesService.findConversations(req.user.userId);
  }

  @Get('messageable-users')
  getMessageableUsers(@Request() req) {
    return this.messagesService.getMessageableUsers(req.user.userId);
  }

  @Get('conversation/:partnerId')
  findConversationMessages(
    @Request() req,
    @Param('partnerId') partnerId: string,
  ) {
    return this.messagesService.findConversationMessages(
      req.user.userId,
      partnerId,
    );
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Request() req) {
    return this.messagesService.markAsRead(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    return this.messagesService.update(id, req.user.userId, updateMessageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.messagesService.remove(id, req.user.userId);
  }
}
