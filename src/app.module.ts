import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { commonConfig, databaseConfig, jwtConfig } from './config'
import { SessionsModule } from './modules/sessions/sessions.module'
import { StoragesModule } from './modules/storages/storages.module'
import { UsersModule } from './modules/users/users.module'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [commonConfig, databaseConfig, jwtConfig],
            envFilePath: ['.env', 'backend.env'],
        }),

        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get<string>('database.host'),
                port: configService.get<number>('database.port'),
                username: configService.get<string>('database.username'),
                password: configService.get<string>('database.password'),
                database: configService.get<string>('database.database'),
                autoLoadEntities: configService.get<boolean>('database.autoLoadEntities'),
                synchronize: configService.get<boolean>('database.synchronize'),
            }),
        }),

        UsersModule,
        SessionsModule,
        StoragesModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
