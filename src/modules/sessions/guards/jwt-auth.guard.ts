import { UseGuards, applyDecorators } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { JWT_REFRESH_STRATEGY } from 'src/modules/sessions/strategies/jwt-refresh.strategy'
import { JWT_STRATEGY } from 'src/modules/sessions/strategies/jwt.strategy'

export const JwtAuthGuard = () => {
    return applyDecorators(UseGuards(AuthGuard(JWT_STRATEGY)))
}

export const JwtRefreshAuthGuard = () => {
    return applyDecorators(UseGuards(AuthGuard(JWT_REFRESH_STRATEGY)))
}
