import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateStorageSchema1769611061640 implements MigrationInterface {
    name = 'CreateStorageSchema1769611061640'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`storages\` (
                \`id\` varchar(36) NOT NULL DEFAULT (UUID()),
                \`filename\` varchar(255) NOT NULL,
                \`folder\` varchar(255) NOT NULL,
                \`full_url\` varchar(255) NOT NULL,
                \`mime_type\` varchar(255) NOT NULL,
                \`is_folder\` tinyint NOT NULL,
                \`size\` int NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`IDX_8d1da31fcb43095ac5cfba0484\` (\`folder\`),
                UNIQUE INDEX \`IDX_1b88b18e449aa646c523eb2252\` (\`folder\`, \`filename\`),
                PRIMARY KEY (\`id\`)
            )
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`IDX_1b88b18e449aa646c523eb2252\` ON \`storages\`
        `)
        await queryRunner.query(`
            DROP INDEX \`IDX_8d1da31fcb43095ac5cfba0484\` ON \`storages\`
        `)
        await queryRunner.query(`
            DROP TABLE \`storages\`
        `)
    }
}
