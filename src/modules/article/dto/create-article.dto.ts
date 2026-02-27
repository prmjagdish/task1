import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateArticleDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  content: string;

  @IsNumber()
  brandId: number;
}