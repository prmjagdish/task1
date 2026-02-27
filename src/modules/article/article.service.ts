import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './entities/article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { BrandAuthor } from '../brand-author/entities/brand-author.entity';
import { Role } from '../../common/enums/role.enum';
import { ArticleStatus } from '../../common/enums/ArticleStatus.enum';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepo: Repository<Article>,

    @InjectRepository(BrandAuthor)
    private readonly brandAuthorRepo: Repository<BrandAuthor>,
  ) {}

  // ================= CREATE ARTICLE =================
  async create(dto: CreateArticleDto, currentUser: any) {
    // BRAND
    if (currentUser.role === Role.BRAND) {
      if (!currentUser.brandId || currentUser.brandId !== dto.brandId) {
        throw new ForbiddenException(
          'You can only create articles for your own brand',
        );
      }
    }

    // AUTHOR
    if (currentUser.role === Role.AUTHOR) {
      const allowed = await this.brandAuthorRepo.findOne({
        where: {
          brand: { id: dto.brandId },
          author: { id: currentUser.userId },
        },
      });

      if (!allowed) {
        throw new ForbiddenException('You are not assigned to this brand');
      }
    }

    const article = this.articleRepo.create({
      title: dto.title,
      content: dto.content,
      brand: { id: dto.brandId },
      author: { id: currentUser.userId },
      status: ArticleStatus.DRAFT,
    });

    return this.articleRepo.save(article);
  }

  // ================= UPDATE CONTENT ONLY =================
  async update(id: number, dto: UpdateArticleDto, currentUser: any) {
    const article = await this.articleRepo.findOne({
      where: { id },
      relations: ['author', 'brand'],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // AUTHOR → only own article
    if (
      currentUser.role === Role.AUTHOR &&
      article.author.id !== currentUser.userId
    ) {
      throw new ForbiddenException('You can update only your own article');
    }

    // BRAND → only their brand article
    if (
      currentUser.role === Role.BRAND &&
      article.brand.id !== currentUser.brandId
    ) {
      throw new ForbiddenException('You can update only your brand articles');
    }

    Object.assign(article, dto);

    return this.articleRepo.save(article);
  }

  // ================= DELETE =================
  async delete(id: number, currentUser: any) {
    const article = await this.articleRepo.findOne({
      where: { id },
      relations: ['author', 'brand'],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (
      currentUser.role === Role.AUTHOR &&
      article.author.id !== currentUser.userId
    ) {
      throw new ForbiddenException();
    }

    if (
      currentUser.role === Role.BRAND &&
      article.brand.id !== currentUser.brandId
    ) {
      throw new ForbiddenException();
    }

    await this.articleRepo.remove(article);

    return { message: 'Article deleted successfully' };
  }

  // ================= CHANGE STATUS =================
  async changeStatus(
    id: number,
    status: ArticleStatus,
    currentUser: any,
  ) {
    const article = await this.articleRepo.findOne({
      where: { id },
      relations: ['author', 'brand'],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // AUTHOR
    if (currentUser.role === Role.AUTHOR) {
      if (article.author.id !== currentUser.userId) {
        throw new ForbiddenException(
          'You can change only your own article status',
        );
      }

      if (
        ![ArticleStatus.DRAFT, ArticleStatus.PENDING_REVIEW].includes(status)
      ) {
        throw new ForbiddenException(
          'Author can only set DRAFT or PENDING_REVIEW',
        );
      }
    }

    // BRAND
    if (currentUser.role === Role.BRAND) {
      if (article.brand.id !== currentUser.brandId) {
        throw new ForbiddenException(
          'You can change only your brand articles',
        );
      }

      if (
        ![ArticleStatus.DRAFT, ArticleStatus.PENDING_REVIEW].includes(status)
      ) {
        throw new ForbiddenException(
          'Brand can only set DRAFT or PENDING_REVIEW',
        );
      }
    }

    // ADMIN / SUPERADMIN
    if (
      currentUser.role === Role.ADMIN ||
      currentUser.role === Role.SUPERADMIN
    ) {
      if (
        ![
          ArticleStatus.PUBLISHED,
          ArticleStatus.ARCHIVED,
          ArticleStatus.REJECTED,
        ].includes(status)
      ) {
        throw new ForbiddenException(
          'Admin can only set PUBLISHED, ARCHIVED or REJECTED',
        );
      }
    }

    article.status = status;

    return this.articleRepo.save(article);
  }

  // ================= LIST BRAND ARTICLES =================
  async listBrandArticles(
    brandId: number,
    status?: ArticleStatus,
  ) {
    return this.articleRepo.find({
      where: {
        brand: { id: brandId },
        ...(status && { status }),
      },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  // ================= LIST OWN ARTICLES =================
  async listOwnArticles(
    userId: string,
    status?: ArticleStatus,
  ) {
    return this.articleRepo.find({
      where: {
        author: { id: userId },
        ...(status && { status }),
      },
      relations: ['brand'],
      order: { createdAt: 'DESC' },
    });
  }

  // ================= ADMIN LIST WITH FILTER =================
  async listAll(
    brandId?: number,
    authorId?: string,
    status?: ArticleStatus,
  ) {
    const where: any = {};

    if (brandId) where.brand = { id: brandId };
    if (authorId) where.author = { id: authorId };
    if (status) where.status = status;

    return this.articleRepo.find({
      where,
      relations: ['brand', 'author'],
      order: { createdAt: 'DESC' },
    });
  }
}