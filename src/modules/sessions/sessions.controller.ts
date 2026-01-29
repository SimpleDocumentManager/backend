import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { LoginDto } from 'src/modules/sessions/dto/login.dto'
import { JwtAuthGuard, JwtRefreshAuthGuard } from 'src/modules/sessions/guards/jwt-auth.guard'
import { User } from 'src/modules/users/entities/user.entity'
import { CurrentUser } from './decorators'
import { SessionsService } from './sessions.service'
import { formatResponse } from 'src/utils/response'

@Controller('sessions')
export class SessionsController {
    constructor(private readonly sessionsService: SessionsService) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto) {
        const data = await this.sessionsService.login(loginDto)
        return formatResponse(data)
    }

    @Get('me')
    @JwtAuthGuard()
    getProfile(@CurrentUser() user: User) {
        return formatResponse(user)
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @JwtRefreshAuthGuard()
    refresh(@CurrentUser() user: User) {
        const data = this.sessionsService.refreshToken(user.id, user.username)
        return formatResponse(data)
    }
}
