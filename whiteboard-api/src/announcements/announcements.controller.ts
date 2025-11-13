import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  QueryAnnouncementsDto,
} from './dto/announcement.dto';

// Use the correct decorator name
@Controller('announcements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateAnnouncementDto) {
    return this.announcementsService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Request() req, @Query() query: QueryAnnouncementsDto) {
    return this.announcementsService.findAll(req.user.userId, query);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.announcementsService.findOne(req.user.userId, id);
  }

  @Put(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateAnnouncementDto,
  ) {
    return this.announcementsService.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.announcementsService.remove(req.user.userId, id);
  }
}
