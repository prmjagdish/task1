import {
  Controller,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Get,
  Request,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { UpdateArticleStatusDto } from './dto/update-article-status.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ArticleStatus } from '../../common/enums/ArticleStatus.enum';

@Controller('articles')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  // ================= CREATE =================
  @Post()
  @Roles(Role.BRAND, Role.AUTHOR)
  create(@Body() dto: CreateArticleDto, @Request() req) {
    return this.articleService.create(dto, req.user);
  }

  // ================= UPDATE CONTENT =================
  @Put(':id')
  @Roles(Role.BRAND, Role.AUTHOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateArticleDto,
    @Request() req,
  ) {
    return this.articleService.update(id, dto, req.user);
  }

  // ================= DELETE =================
  @Delete(':id')
  @Roles(Role.BRAND, Role.AUTHOR)
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.articleService.delete(id, req.user);
  }

  // ================= BRAND LIST =================
  @Get('brand/:brandId')
  @Roles(Role.ADMIN, Role.SUPERADMIN, Role.BRAND)
  listBrand(
    @Param('brandId', ParseIntPipe) brandId: number,
    @Query('status') status?: ArticleStatus,
  ) {
    return this.articleService.listBrandArticles(brandId, status);
  }

  // ================= AUTHOR LIST =================
  @Get('my')
  @Roles(Role.AUTHOR)
  listOwn(
    @Request() req,
    @Query('status') status?: ArticleStatus,
  ) {
    return this.articleService.listOwnArticles(
      req.user.userId,
      status,
    );
  }

  // ================= ADMIN LIST =================
  @Get()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  listAll(
    @Query('brandId') brandId?: number,
    @Query('authorId') authorId?: string,
    @Query('status') status?: ArticleStatus,
  ) {
    return this.articleService.listAll(brandId, authorId, status);
  }

  // ================= CHANGE STATUS =================
  @Put(':id/status')
  @Roles(Role.ADMIN, Role.SUPERADMIN, Role.BRAND, Role.AUTHOR)
  changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateArticleStatusDto,
    @Request() req,
  ) {
    return this.articleService.changeStatus(
      id,
      dto.status,
      req.user,
    );
  }
}