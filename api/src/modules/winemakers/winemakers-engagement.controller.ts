import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCommentDto } from '../content/dto/create-comment.dto';
import { WinemakersEngagementService } from './winemakers-engagement.service';

type TargetTypeParam = 'person' | 'wine';

@Controller('catalog')
export class WinemakersEngagementController {
  constructor(private readonly engagementService: WinemakersEngagementService) {}

  @Get(':targetType/:targetId/comments')
  comments(
    @Param('targetType') targetType: TargetTypeParam,
    @Param('targetId') targetId: string,
  ) {
    return this.engagementService.getComments(targetType, targetId);
  }

  @Post(':targetType/:targetId/comments')
  @UseGuards(JwtAuthGuard)
  createComment(
    @Param('targetType') targetType: TargetTypeParam,
    @Param('targetId') targetId: string,
    @Request() req,
    @Body() dto: CreateCommentDto,
  ) {
    return this.engagementService.createComment(targetType, targetId, req.user.userId, dto.body);
  }

  @Delete(':targetType/:targetId/comments/:commentId')
  @UseGuards(JwtAuthGuard)
  deleteComment(
    @Param('targetType') targetType: TargetTypeParam,
    @Param('targetId') targetId: string,
    @Param('commentId') commentId: string,
    @Request() req,
  ) {
    return this.engagementService.deleteComment(targetType, targetId, commentId, req.user.userId);
  }
}
