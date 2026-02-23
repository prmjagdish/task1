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
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('articles')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  // Create Article
  @Post()
  @Roles(Role.BRAND, Role.AUTHOR)
  create(@Body() dto: CreateArticleDto, @Request() req) {
    console.log('Creating article with DTO:', dto);
    console.log('Current user:', req.user);
    return this.articleService.create(dto, req.user);
  }

  // Update Article
  @Put(':id')
  @Roles(Role.BRAND, Role.AUTHOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateArticleDto,
    @Request() req,
  ) {
    return this.articleService.update(id, dto, req.user);
  }

  // Delete Article
  @Delete(':id')
  @Roles(Role.BRAND, Role.AUTHOR)
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.articleService.delete(id, req.user);
  }

  // List Articles by Brand
  @Get('brand/:brandId')
  @Roles(Role.ADMIN, Role.SUPERADMIN, Role.BRAND)
  listBrand(
    @Param('brandId', ParseIntPipe) brandId: number,
  ) {
    return this.articleService.listBrandArticles(brandId);
  }

  // List Own Articles (Author)
  @Get('my')
  @Roles(Role.AUTHOR)
  listOwn(@Request() req) {
    return this.articleService.listOwnArticles(req.user.userId);
  }
}