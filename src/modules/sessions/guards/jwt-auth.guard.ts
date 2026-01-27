import { UseGuards, applyDecorators } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

export const JwtAuthGuard = () => {
    return applyDecorators(UseGuards(AuthGuard('jwt')))
}
