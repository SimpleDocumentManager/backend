import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { StringValue } from 'ms'
import { JwtRefreshStrategy } from 'src/modules/sessions/strategies/jwt-refresh.strategy'
import { UsersModule } from '../users/users.module'
import { SessionsController } from './sessions.controller'
import { SessionsService } from './sessions.service'
import { JwtStrategy } from './strategies/jwt.strategy'

@Module({
    imports: [
        UsersModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.getOrThrow<string>('jwt.secret'),
                signOptions: {
                    expiresIn: configService.getOrThrow<string>('jwt.expiresIn') as StringValue,
                },
            }),
        }),
    ],
    controllers: [SessionsController],
    providers: [SessionsService, JwtStrategy, JwtRefreshStrategy],
    exports: [SessionsService],
})
export class SessionsModule {}
