import { Transform } from 'class-transformer'
import { IsString } from 'class-validator'
import { sanitizePath } from 'src/utils/path'

export class UploadStorageDto {
    @IsString()
    @Transform(({ value }) => sanitizePath(value as string))
    dir: string
}
