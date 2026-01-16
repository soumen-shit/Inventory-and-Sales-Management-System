import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeColumnIsActiveToIsActive1768559173738 implements MigrationInterface {
    name = 'ChangeColumnIsActiveToIsActive1768559173738'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_categories" RENAME COLUMN "isActive" TO "is_active"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_categories" RENAME COLUMN "is_active" TO "isActive"`);
    }

}
