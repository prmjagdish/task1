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

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepo: Repository<Article>,

    @InjectRepository(BrandAuthor)
    private readonly brandAuthorRepo: Repository<BrandAuthor>,
  ) {}

  // 🔹 CREATE ARTICLE
  async create(dto: CreateArticleDto, currentUser: any) {
    // BRAND USER
    if (currentUser.role === Role.BRAND) {
      if (!currentUser.brandId || currentUser.brandId !== dto.brandId) {
        throw new ForbiddenException(
          'You can only create articles for your own brand',
        );
      }
    }

    // AUTHOR USER
    if (currentUser.role === Role.AUTHOR) {
      const allowed = await this.brandAuthorRepo.findOne({
        where: {
          brand: { id: dto.brandId },
          author: { id: currentUser.userId },
        },
      });

      if (!allowed) {
        throw new ForbiddenException(
          'You are not assigned to this brand',
        );
      }
    }

    const article = this.articleRepo.create({
      title: dto.title,
      content: dto.content,
      brand: { id: dto.brandId },
      author: { id: currentUser.userId },
    });

    return this.articleRepo.save(article);
  }

  // UPDATE ARTICLE
  async update(id: number, dto: UpdateArticleDto, currentUser: any) {
    const article = await this.articleRepo.findOne({
      where: { id },
      relations: ['author', 'brand'],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // AUTHOR can update only own article
    if (
      currentUser.role === Role.AUTHOR &&
      article.author.id !== currentUser.userId
    ) {
      throw new ForbiddenException('You can update only your own article');
    }

    // BRAND user can update only their brand articles
    if (
      currentUser.role === Role.USER &&
      article.brand.id !== currentUser.brandId
    ) {
      throw new ForbiddenException(
        'You can update only your brand articles',
      );
    }

    Object.assign(article, dto);

    return this.articleRepo.save(article);
  }

  // DELETE ARTICLE
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
      currentUser.role === Role.USER &&
      article.brand.id !== currentUser.brandId
    ) {
      throw new ForbiddenException();
    }

    await this.articleRepo.remove(article);

    return { message: 'Article deleted successfully' };
  }

  // LIST BRAND ARTICLES
  async listBrandArticles(brandId: number) {
    return this.articleRepo.find({
      where: { brand: { id: brandId } },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  // LIST OWN ARTICLES (Author)
  async listOwnArticles(userId: string) {
    return this.articleRepo.find({
      where: { author: { id: userId } },
      relations: ['brand'],
      order: { createdAt: 'DESC' },
    });
  }
}