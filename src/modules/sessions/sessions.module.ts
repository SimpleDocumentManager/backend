import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { StringValue } from 'ms'
import { UsersModule } from '../users/users.module'
import { SessionsService } from './sessions.service'
import { SessionsController } from './sessions.controller'
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
    providers: [SessionsService, JwtStrategy],
    exports: [SessionsService, JwtStrategy],
})
export class SessionsModule {}
