import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { BrandStatus } from '../../common/enums/brand-status.enum';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { User } from '../users/entities/user.entity';
import { Role } from '../../common/enums/role.enum';
import * as bcrypt from 'bcrypt';
import { MailService } from '../../common/mail/mail.service';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepo: Repository<Brand>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly mailService: MailService,

    private readonly dataSource: DataSource,
  ) {}

  async create(
    dto: CreateBrandDto,
    currentUser: { userId: string },
  ): Promise<Brand> {
    const existingUser = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    return this.dataSource.transaction(async (manager) => {
      const brand = manager.create(Brand, {
        name: dto.name,
        description: dto.description,
        logoUrl: dto.logoUrl,
        createdBy: { id: currentUser.userId } as User,
      });

      const savedBrand = await manager.save(brand);

      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const brandUser = manager.create(User, {
          email: dto.email,
          password: hashedPassword,
          role: Role.BRAND,
          brand: savedBrand,
        });

      await manager.save(brandUser);

      await this.mailService.sendBrandCredentials(dto.email, tempPassword);

      return savedBrand;
    });
  }

  async findAll(): Promise<Brand[]> {
    return this.brandRepo.find({
      relations: { createdBy: true },
    });
  }

  async update(
    id: number,
    dto: UpdateBrandDto,
    currentUser: { userId: string; role: Role },
  ): Promise<Brand> {
    const brand = await this.brandRepo.findOne({ where: { id } });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    if (currentUser.role === Role.USER) {
      const user = await this.userRepo.findOne({
        where: { id: currentUser.userId },
        relations: ['brand'],
      });

      if (!user?.brand || user.brand.id !== id) {
        throw new ForbiddenException(
          'You are not allowed to update this brand',
        );
      }
    }

    Object.assign(brand, dto);

    return this.brandRepo.save(brand);
  }

  async remove(id: number): Promise<{ message: string }> {
    const brand = await this.brandRepo.findOne({ where: { id } });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    await this.brandRepo.remove(brand);

    return { message: 'Brand deleted successfully' };
  }

  async changeStatus(id: number, status: BrandStatus): Promise<Brand> {
    const brand = await this.brandRepo.findOne({ where: { id } });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    brand.status = status;

    return this.brandRepo.save(brand);
  }
}
