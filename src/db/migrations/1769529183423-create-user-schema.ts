import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateUserSchema1769529183423 implements MigrationInterface {
    name = 'CreateUserSchema1769529183423'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`users\` (
                \`id\` varchar(36) NOT NULL,
                \`username\` varchar(255) NOT NULL,
                \`password\` varchar(255) NOT NULL,
                \`name\` varchar(255) NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_fe0bb3f6520ee0469504521e71\` (\`username\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`IDX_fe0bb3f6520ee0469504521e71\` ON \`users\`
        `)
        await queryRunner.query(`
            DROP TABLE \`users\`
        `)
    }
}
