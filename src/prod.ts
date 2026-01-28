import { INestApplication, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { hash as bcryptHash } from 'bcrypt'
import { resolve as resolvePath } from 'path'
import { createAndBootstrapApp } from 'src/app'
import { User } from 'src/modules/users/entities/user.entity'
import { DataSource } from 'typeorm'

async function migrateAndSeed(app: INestApplication) {
    const configService = app.get(ConfigService)

    const datasourceMigrator = new DataSource({
        type: 'mysql',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        migrations: [resolvePath(__dirname, 'db', 'migrations', '*{.js,.ts}')],
        entities: [User],
    })

    try {
        Logger.log('Migrate and seed database started', 'MigrateAndSeed')

        await datasourceMigrator.initialize()
        await datasourceMigrator.runMigrations()

        const userRepository = datasourceMigrator.getRepository(User)
        const existingAdmin = await userRepository.findOne({ where: { username: 'admin' } })
        if (!existingAdmin) {
            const hashedPassword = await bcryptHash('admin', 10)
            await userRepository.save({
                username: 'admin',
                name: 'Admin',
                password: hashedPassword,
            })
        }

        await datasourceMigrator.destroy()

        Logger.log('Migrate and seed database finished', 'MigrateAndSeed')
    } catch (error) {
        await app.close().catch(() => {
            /* ignore */
        })
        await datasourceMigrator.destroy().catch(() => {
            /* ignore */
        })
        throw error
    }
}

async function bootstrap() {
    const app = await createAndBootstrapApp()

    await migrateAndSeed(app)
}
void bootstrap()
