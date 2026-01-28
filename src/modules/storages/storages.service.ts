import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Response } from 'express'
import { createReadStream, existsSync, mkdirSync } from 'fs'
import { writeFile } from 'fs/promises'
import { extname, join } from 'path'
import { QueryStorageDto } from 'src/modules/storages/dto/query-storage.dto'
import { UploadStorageDto } from 'src/modules/storages/dto/upload-storage.dto'
import { sanitizePath } from 'src/utils/path'
import { DataSource, EntityManager, FindManyOptions, ILike, Like, Repository } from 'typeorm'
import { Storage } from './entities/storage.entity'
import { CreateFolderDto } from 'src/modules/storages/dto/create-folder.dto'

@Injectable()
export class StoragesService {
    private readonly uploadDir: string
    private readonly storageUrl: string

    constructor(
        @InjectRepository(Storage)
        private readonly storageRepository: Repository<Storage>,
        private readonly configService: ConfigService,
        private readonly dataSource: DataSource,
    ) {
        const storageDir = this.configService.get<string>('common.storageDir') || 'storage'
        this.uploadDir = join(process.cwd(), storageDir)
        this.storageUrl = this.configService.get<string>('common.storageUrl') || ''
        this.ensureUploadDirExists()
    }

    private ensureUploadDirExists(): void {
        if (!existsSync(this.uploadDir)) {
            mkdirSync(this.uploadDir, { recursive: true })
        }
    }

    async createFolder(dto: CreateFolderDto): Promise<Storage> {
        return this.dataSource.transaction(async (manager) => {
            const path = sanitizePath(`${dto.dir}/${dto.name}`)

            await this.createParentDirectoriesInTx(manager, dto.dir)

            const storage = manager.create(Storage, {
                filename: dto.name,
                folder: dto.dir,
                fullUrl: `${this.storageUrl}${path}`,
                mimeType: 'folder',
                isFolder: true,
                size: 0,
            })

            return manager.save(storage)
        })
    }

    async upload(file: Express.Multer.File, dto: UploadStorageDto): Promise<Storage> {
        return this.dataSource.transaction(async (manager) => {
            const path = sanitizePath(`${dto.dir}/${file.originalname}`)

            await this.createParentDirectoriesInTx(manager, dto.dir)

            let storage = await manager.findOne(Storage, {
                where: { filename: file.originalname, folder: dto.dir },
            })

            if (!storage) {
                storage = manager.create(Storage, {
                    filename: file.originalname,
                    folder: dto.dir,
                    fullUrl: `${this.storageUrl}${path}`,
                    mimeType: file.mimetype,
                    isFolder: false,
                    size: file.size,
                })
            } else {
                storage.size = file.size
                storage.fullUrl = `${this.storageUrl}${path}`
            }

            const savedStorage = await manager.save(storage)

            try {
                const diskPath = this.getLocalStoragePath(storage)

                await writeFile(diskPath, file.buffer)
            } catch {
                throw new InternalServerErrorException('Failed to write file to disk')
            }

            return savedStorage
        })
    }

    async findAll(dto: QueryStorageDto): Promise<Storage[]> {
        const options: FindManyOptions = {}

        if (dto.search) {
            options.where = {
                filename: ILike(`%${dto.search}%`),
                folder: Like(`${dto.dir}%`),
            }
            options.order = { isFolder: 'DESC', filename: 'ASC', folder: 'ASC' }
            options.take = 20
        } else if (dto.dir) {
            options.where = { folder: dto.dir }
            options.order = { isFolder: 'DESC', filename: 'ASC' }
        }

        return await this.storageRepository.find(options)
    }

    async streamFile(res: Response, path: string) {
        const paths = sanitizePath(path).split('/')

        const filename = paths.pop()
        const folder = paths.join('/') || '/'

        const storage = await this.storageRepository.findOne({
            where: { filename, folder },
        })

        if (!storage || storage.isFolder) {
            throw new NotFoundException('File not found')
        }

        const diskPath = this.getLocalStoragePath(storage)

        res.set('Content-Type', storage.mimeType)
        res.set('Content-Length', storage.size.toString())
        res.set('Content-Disposition', `inline; filename="${storage.filename}"`)

        createReadStream(diskPath).pipe(res)
    }

    private async createParentDirectoriesInTx(manager: EntityManager, dir: string) {
        const folders = dir.split('/')

        await Promise.all(
            folders.map(async (folder, i) => {
                if (folder === '') {
                    return
                }

                const parentFolder = folders.slice(0, i).join('/') || '/'

                const existingParentFolder = await manager.findOne(Storage, {
                    where: { filename: folder, folder: parentFolder },
                    select: { isFolder: true },
                })
                if (existingParentFolder) {
                    if (!existingParentFolder.isFolder) {
                        throw new ForbiddenException(`${parentFolder}/${folder} is not a folder`)
                    }
                    return
                }

                await manager.save(Storage, {
                    filename: folder,
                    folder: parentFolder,
                    fullUrl: `${this.storageUrl}/${parentFolder}`,
                    mimeType: 'folder',
                    isFolder: true,
                    size: 0,
                })
            }),
        )
    }

    private getLocalStorageFilename(storage: Storage): string {
        const ext = extname(storage.filename)
        return `${storage.id}${ext}`
    }

    private getLocalStoragePath(storage: Storage): string {
        const filename = this.getLocalStorageFilename(storage)
        return join(this.uploadDir, filename)
    }
}
