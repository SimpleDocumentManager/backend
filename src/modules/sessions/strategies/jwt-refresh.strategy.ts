import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UsersService } from '../../users/users.service'
import { JwtPayload } from '../interfaces/jwt-payload.interface'

export const JWT_REFRESH_STRATEGY = 'jwt-refresh' as const

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, JWT_REFRESH_STRATEGY) {
    constructor(
        readonly configService: ConfigService,
        private readonly usersService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>('jwt.refreshSecret'),
        })
    }

    async validate(payload: JwtPayload) {
        const user = await this.usersService.findById(payload.id)
        if (!user) {
            throw new UnauthorizedException()
        }
        return user
    }
}
