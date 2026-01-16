import { MigrationInterface, QueryRunner } from 'typeorm';

export class PasswordLengthChange1768487934069 implements MigrationInterface {
  name = 'PasswordLengthChange1768487934069';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "password" character varying(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "password" character varying(50) NOT NULL`,
    );
  }
}
