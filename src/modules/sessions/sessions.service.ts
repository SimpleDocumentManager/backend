import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { StringValue } from 'ms'
import { UsersService } from '../users/users.service'
import { LoginDto } from './dto/login.dto'
import { JwtPayload } from 'src/modules/sessions/interfaces/jwt-payload.interface'

@Injectable()
export class SessionsService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    async login(dto: LoginDto) {
        const user = await this.usersService.findByUsername(dto.username)
        if (!user) {
            throw new UnauthorizedException('Invalid credentials')
        }

        const isPasswordValid = await this.usersService.validatePassword(dto.password, user.password)
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials')
        }

        return this.generateTokens(user.id, user.username)
    }

    refreshToken(userId: string, username: string) {
        return this.generateTokens(userId, username)
    }

    private generateTokens(userId: string, username: string) {
        const payload: JwtPayload = { id: userId, username }

        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.getOrThrow<string>('jwt.secret'),
            expiresIn: this.configService.getOrThrow<string>('jwt.expiresIn') as StringValue,
        })

        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
            expiresIn: this.configService.getOrThrow<string>('jwt.refreshExpiresIn') as StringValue,
        })

        return {
            accessToken,
            refreshToken,
        }
    }
}
