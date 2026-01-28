import { registerAs } from '@nestjs/config'

export default registerAs('common', () => {
    const port = parseInt(process.env.PORT || '3000', 10)
    const baseUrl = process.env.BASE_URL || `http://localhost:${port}`

    return {
        nodeEnv: process.env.NODE_ENV || 'development',
        port,
        baseUrl,
        storageDir: 'storage',
        storageUrl: process.env.STORAGE_URL || `${baseUrl}/storages`,
    }
})
