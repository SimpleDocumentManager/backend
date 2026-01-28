import { HttpStatus } from '@nestjs/common'

export function formatResponse<T>(data: T, statusCode = HttpStatus.OK, message: string = 'Success') {
    return {
        data,
        statusCode,
        message,
    }
}
