import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUploaderToStorage1769615867804 implements MigrationInterface {
    name = 'AddUploaderToStorage1769615867804'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`storages\`
            ADD \`uploader_id\` varchar(36) NOT NULL
        `)
        await queryRunner.query(`
            ALTER TABLE \`storages\`
            ADD CONSTRAINT \`FK_8d77e826aa9f4dc0eb96976cfcc\` FOREIGN KEY (\`uploader_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`storages\` DROP FOREIGN KEY \`FK_8d77e826aa9f4dc0eb96976cfcc\`
        `)
        await queryRunner.query(`
            ALTER TABLE \`storages\` DROP COLUMN \`uploader_id\`
        `)
    }
}
