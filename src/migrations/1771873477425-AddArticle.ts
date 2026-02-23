import { MigrationInterface, QueryRunner } from "typeorm";

export class AddArticle1771873477425 implements MigrationInterface {
    name = 'AddArticle1771873477425'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" DROP CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34"`);
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "brand_authors" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "articles" DROP CONSTRAINT "FK_e6e39d09da997d0a04fac70bc0c"`);
        await queryRunner.query(`ALTER TABLE "articles" DROP CONSTRAINT "PK_0a6e2c450d83e0b6052c2793334"`);
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "articles" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "articles" ADD CONSTRAINT "PK_0a6e2c450d83e0b6052c2793334" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "articles" ALTER COLUMN "brandId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "articles" ALTER COLUMN "authorId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('USER', 'AUTHOR', 'ADMIN', 'SUPERADMIN')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING "role"::"text"::"public"."users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER'`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "brand_authors" DROP CONSTRAINT "FK_3b2b1c2c1ce81ece5a239c1bfba"`);
        await queryRunner.query(`ALTER TABLE "brand_authors" DROP CONSTRAINT "FK_0808932182db805ab7714e15013"`);
        await queryRunner.query(`ALTER TABLE "brand_authors" DROP CONSTRAINT "UQ_ce62157e00dd93e0643567f0abc"`);
        await queryRunner.query(`ALTER TABLE "brand_authors" ALTER COLUMN "brandId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "brand_authors" ALTER COLUMN "authorId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "brand_authors" ADD CONSTRAINT "UQ_ce62157e00dd93e0643567f0abc" UNIQUE ("brandId", "authorId")`);
        await queryRunner.query(`ALTER TABLE "articles" ADD CONSTRAINT "FK_e6e39d09da997d0a04fac70bc0c" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "articles" ADD CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "brand_authors" ADD CONSTRAINT "FK_3b2b1c2c1ce81ece5a239c1bfba" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "brand_authors" ADD CONSTRAINT "FK_0808932182db805ab7714e15013" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "brand_authors" DROP CONSTRAINT "FK_0808932182db805ab7714e15013"`);
        await queryRunner.query(`ALTER TABLE "brand_authors" DROP CONSTRAINT "FK_3b2b1c2c1ce81ece5a239c1bfba"`);
        await queryRunner.query(`ALTER TABLE "articles" DROP CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34"`);
        await queryRunner.query(`ALTER TABLE "articles" DROP CONSTRAINT "FK_e6e39d09da997d0a04fac70bc0c"`);
        await queryRunner.query(`ALTER TABLE "brand_authors" DROP CONSTRAINT "UQ_ce62157e00dd93e0643567f0abc"`);
        await queryRunner.query(`ALTER TABLE "brand_authors" ALTER COLUMN "authorId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "brand_authors" ALTER COLUMN "brandId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "brand_authors" ADD CONSTRAINT "UQ_ce62157e00dd93e0643567f0abc" UNIQUE ("brandId", "authorId")`);
        await queryRunner.query(`ALTER TABLE "brand_authors" ADD CONSTRAINT "FK_0808932182db805ab7714e15013" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "brand_authors" ADD CONSTRAINT "FK_3b2b1c2c1ce81ece5a239c1bfba" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum_old" AS ENUM('USER', 'AUTHOR', 'ADMIN', 'SUPERADMIN', 'BRAND')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum_old" USING "role"::"text"::"public"."users_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER'`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum_old" RENAME TO "users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "articles" ALTER COLUMN "authorId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "articles" ALTER COLUMN "brandId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "articles" DROP CONSTRAINT "PK_0a6e2c450d83e0b6052c2793334"`);
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "articles" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "articles" ADD CONSTRAINT "PK_0a6e2c450d83e0b6052c2793334" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "articles" ADD CONSTRAINT "FK_e6e39d09da997d0a04fac70bc0c" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "brand_authors" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "articles" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "articles" ADD CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
