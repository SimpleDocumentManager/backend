import { Transform } from 'class-transformer'
import { IsNotEmpty, IsString } from 'class-validator'
import { sanitizePath } from 'src/utils/path'

export class CreateFolderDto {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @Transform(({ value }) => sanitizePath(value as string))
    dir: string
}
