import { registerAs } from '@nestjs/config'

export default registerAs('common', () => ({
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
}))
