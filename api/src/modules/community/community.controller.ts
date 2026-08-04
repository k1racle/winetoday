import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

class AddStopWordDto {
  @IsString()
  @IsNotEmpty()
  word: string;
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin, Role.editor)
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get('comments')
  listComments(@Query() query: { limit?: string; offset?: string }) {
    return this.communityService.listComments(query);
  }

  @Delete('comments/:id')
  deleteComment(@Param('id') id: string) {
    return this.communityService.deleteComment(id);
  }

  @Get('comment-stop-words')
  listStopWords() {
    return this.communityService.listStopWords();
  }

  @Post('comment-stop-words')
  addStopWord(@Body() dto: AddStopWordDto) {
    return this.communityService.addStopWord(dto.word);
  }

  @Delete('comment-stop-words/:id')
  deleteStopWord(@Param('id') id: string) {
    return this.communityService.deleteStopWord(id);
  }
}
