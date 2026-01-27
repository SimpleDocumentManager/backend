import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { LoginDto } from 'src/modules/sessions/dto/login.dto'
import { JwtAuthGuard } from 'src/modules/sessions/guards/jwt-auth.guard'
import { User } from 'src/modules/users/entities/user.entity'
import { CurrentUser } from './decorators'
import { SessionsService } from './sessions.service'

@Controller('sessions')
export class SessionsController {
    constructor(private readonly sessionsService: SessionsService) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Body() loginDto: LoginDto) {
        return this.sessionsService.login(loginDto)
    }

    @Get('me')
    @JwtAuthGuard()
    getProfile(@CurrentUser() user: User) {
        return user
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @JwtAuthGuard()
    refresh(@CurrentUser() user: User) {
        return this.sessionsService.refreshToken(user.id, user.username)
    }
}
