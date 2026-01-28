import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Query,
    Req,
    Res,
    UploadedFile,
    UseInterceptors,
    Version,
    VERSION_NEUTRAL,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import type { Request, Response } from 'express'
import { JwtAuthGuard } from 'src/modules/sessions/guards/jwt-auth.guard'
import { CreateFolderDto } from 'src/modules/storages/dto/create-folder.dto'
import { QueryStorageDto } from 'src/modules/storages/dto/query-storage.dto'
import { UploadStorageDto } from 'src/modules/storages/dto/upload-storage.dto'
import { formatResponse } from 'src/utils/response'
import { StoragesService } from './storages.service'

@Controller('storages')
export class StoragesController {
    constructor(private readonly storagesService: StoragesService) {}

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    @HttpCode(HttpStatus.CREATED)
    @JwtAuthGuard()
    async upload(@UploadedFile() file: Express.Multer.File, @Body() dto: UploadStorageDto) {
        const storage = await this.storagesService.upload(file, dto)
        return formatResponse(storage, HttpStatus.CREATED, 'Created')
    }

    @Post('folder')
    @HttpCode(HttpStatus.CREATED)
    @JwtAuthGuard()
    async createFolder(@Body() dto: CreateFolderDto) {
        const storage = await this.storagesService.createFolder(dto)
        return formatResponse(storage, HttpStatus.CREATED, 'Created')
    }

    @Get()
    @JwtAuthGuard()
    async findAll(@Query() dto: QueryStorageDto) {
        const storages = await this.storagesService.findAll(dto)
        return formatResponse(storages)
    }

    @Get('*path')
    @Version(VERSION_NEUTRAL)
    async streamDocument(@Req() req: Request, @Res() res: Response) {
        const path = (req.params as { path: string[] }).path.join('/')
        await this.storagesService.streamFile(res, path)
    }
}
