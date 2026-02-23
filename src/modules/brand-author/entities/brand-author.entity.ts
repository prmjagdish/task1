import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Brand } from '../../brand/entities/brand.entity';
import { User } from '../../users/entities/user.entity';

@Entity('brand_authors')
@Unique(['brand', 'author'])
export class BrandAuthor {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Brand, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'brandId' })
  brand: Brand;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User;
}