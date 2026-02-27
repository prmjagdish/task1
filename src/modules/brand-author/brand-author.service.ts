import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrandAuthor } from './entities/brand-author.entity';
import { Brand } from '../brand/entities/brand.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class BrandAuthorService {
  constructor(
    @InjectRepository(BrandAuthor)
    private readonly brandAuthorRepo: Repository<BrandAuthor>,

    @InjectRepository(Brand)
    private readonly brandRepo: Repository<Brand>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // 🔹 Assign Author to Brand
  async assignAuthor(brandId: number, authorId: string) {
    const brand = await this.brandRepo.findOne({ where: { id: brandId } });
    if (!brand) throw new NotFoundException('Brand not found');

    const author = await this.userRepo.findOne({
      where: { id: authorId },
    });

    if (!author) throw new NotFoundException('User not found');

    if (author.role !== Role.AUTHOR) {
      throw new ForbiddenException('User is not an AUTHOR');
    }

    const existing = await this.brandAuthorRepo.findOne({
      where: {
        brand: { id: brandId },
        author: { id: authorId },
      },
    });

    if (existing) {
      throw new ConflictException('Author already assigned');
    }

    const mapping = this.brandAuthorRepo.create({
      brand: { id: brandId },
      author: { id: authorId },
    });

    return this.brandAuthorRepo.save(mapping);
  }

  // 🔹 Remove Author from Brand
  async removeAuthor(brandId: number, authorId: string) {
    const mapping = await this.brandAuthorRepo.findOne({
      where: {
        brand: { id: brandId },
        author: { id: authorId },
      },
    });

    if (!mapping) {
      throw new NotFoundException('Assignment not found');
    }

    await this.brandAuthorRepo.remove(mapping);

    return { message: 'Author removed from brand' };
  }

  // 🔹 List Authors of a Brand
  async listBrandAuthors(brandId: number) {
    return this.brandAuthorRepo.find({
      where: { brand: { id: brandId } },
      relations: ['author'],
    });
  }

  // 🔹 List Brands assigned to an Author
  async listAuthorBrands(authorId: string) {
    return this.brandAuthorRepo.find({
      where: { author: { id: authorId } },
      relations: ['brand'],
    });
  }
}