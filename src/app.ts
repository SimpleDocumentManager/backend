import { ValidationPipe, VersioningType } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

export async function createAndBootstrapApp() {
    const app = await NestFactory.create(AppModule)

    const configService = app.get(ConfigService)

    app.enableCors()
    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
    })

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    )

    await app.listen(configService.getOrThrow<number>('common.port'))

    return app
}
