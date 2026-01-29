import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UsersService } from '../../users/users.service'
import { JwtPayload } from '../interfaces/jwt-payload.interface'

export const JWT_STRATEGY = 'jwt' as const

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_STRATEGY) {
    constructor(
        readonly configService: ConfigService,
        private readonly usersService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: true,
            secretOrKey: configService.getOrThrow<string>('jwt.secret'),
        })
    }

    async validate(payload: JwtPayload) {
        if (payload.exp && Date.now() > payload.exp * 1000) {
            throw new UnauthorizedException('Token expired, please refresh your token')
        }

        const user = await this.usersService.findById(payload.id)
        if (!user) {
            throw new UnauthorizedException()
        }
        return user
    }
}
