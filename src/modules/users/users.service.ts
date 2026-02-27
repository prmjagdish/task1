import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../../common/enums/role.enum';
import * as bcrypt from 'bcrypt';
import { ConflictException } from '@nestjs/common';
import { AdminCreateDto } from './dto/admin-create.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

 async findByEmail(email: string, includePassword = false) {
  if (includePassword) {
    return this.userRepo.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role'],
      relations: ['brand'], 
    });
  }

  return this.userRepo.findOne({
    where: { email },
    relations: ['brand'],
  });
}

  create(user: Partial<User>) {
    return this.userRepo.save(user);
  }

 async updateRole(
  userId: string,
  newRole: Role,
  currentUserRole: Role,
) {
  const roleHierarchy = {
    SUPERADMIN: 4,
    ADMIN: 3,
    AUTHOR: 2,
    USER: 1,
  };

  const currentLevel = roleHierarchy[currentUserRole];
  const newLevel = roleHierarchy[newRole];

  if (newLevel >= currentLevel) {
    throw new Error('You cannot assign this role');
  }

  await this.userRepo.update(userId, { role: newRole });

  return { message: 'User role updated successfully' };
}
async createAdmin(dto: AdminCreateDto) {
  const existingUser = await this.userRepo.findOne({
    where: { email: dto.email },
  });

  if (existingUser) {
    throw new ConflictException('User already exists');
  }

  const hashedPassword = await bcrypt.hash(dto.password, 10);

  const newAdmin = this.userRepo.create({
    email: dto.email,
    password: hashedPassword,
    role: Role.ADMIN,
  });

  const savedAdmin = await this.userRepo.save(newAdmin);

  const { password, ...result } = savedAdmin;

  return result;
}
}