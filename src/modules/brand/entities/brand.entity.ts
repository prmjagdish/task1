import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BrandStatus } from '../../../common/enums/brand-status.enum';
import { Article } from '../../article/entities/article.entity';

@Entity('brands')
export class Brand {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  logoUrl?: string;

  @Column({
    type: 'enum',
    enum: BrandStatus,
    default: BrandStatus.DISAPPROVED,
  })
  status: BrandStatus;

  // Admin who created this brand
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'createdBy' })
  createdBy: User;

  @OneToMany(() => User, (user) => user.brand)
  users: User[];

  @OneToMany(() => Article, (article) => article.brand)
  articles: Article[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
