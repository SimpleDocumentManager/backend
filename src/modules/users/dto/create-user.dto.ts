import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator'

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    username: string

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string

    @IsString()
    @IsOptional()
    name?: string
}
