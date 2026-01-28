import { registerAs } from '@nestjs/config'

export default registerAs('jwt', () => ({
    secret: process.env.JWT_SECRET || 'JwtReallySecret',
    expiresIn: process.env.JWT_EXPIRES_IN || '10m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'JwtRefreshReallySecret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
}))
