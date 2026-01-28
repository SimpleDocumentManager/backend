import { Transform } from 'class-transformer'
import { IsOptional, IsString } from 'class-validator'
import { sanitizePath } from 'src/utils/path'

export class QueryStorageDto {
    @IsString()
    @Transform(({ value }) => sanitizePath(value as string))
    dir: string

    @IsString()
    @IsOptional()
    search?: string
}
