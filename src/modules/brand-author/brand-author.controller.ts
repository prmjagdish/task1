import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { BrandAuthorService } from './brand-author.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('brand-authors')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class BrandAuthorController {
  constructor(
    private readonly brandAuthorService: BrandAuthorService,
  ) {}

  // Assign Author to Brand
  @Post(':brandId/:authorId')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  assign(
    @Param('brandId', ParseIntPipe) brandId: number,
    @Param('authorId') authorId: string,
  ) {
    return this.brandAuthorService.assignAuthor(
      brandId,
      authorId,
    );
  }

  // Remove Author from Brand
  @Delete(':brandId/:authorId')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  remove(
    @Param('brandId', ParseIntPipe) brandId: number,
    @Param('authorId') authorId: string,
  ) {
    return this.brandAuthorService.removeAuthor(
      brandId,
      authorId,
    );
  }

  // List Authors of Brand
  @Get('brand/:brandId')
  @Roles(Role.ADMIN, Role.SUPERADMIN, Role.USER)
  listBrandAuthors(
    @Param('brandId', ParseIntPipe) brandId: number,
  ) {
    return this.brandAuthorService.listBrandAuthors(
      brandId,
    );
  }

  // List Brands of Author
  @Get('author/:authorId')
  @Roles(Role.ADMIN, Role.SUPERADMIN, Role.AUTHOR)
  listAuthorBrands(@Param('authorId') authorId: string) {
    return this.brandAuthorService.listAuthorBrands(
      authorId,
    );
  }
}