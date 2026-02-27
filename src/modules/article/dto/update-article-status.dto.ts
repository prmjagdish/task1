import { IsEnum } from 'class-validator';
import { ArticleStatus } from '../../../common/enums/ArticleStatus.enum';

export class UpdateArticleStatusDto {
  @IsEnum(ArticleStatus)
  status: ArticleStatus;
}