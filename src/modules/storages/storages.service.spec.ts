/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing'
import { StoragesService } from './storages.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Storage } from './entities/storage.entity'
import { ConfigService } from '@nestjs/config'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { ConflictException, ForbiddenException, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import * as fs from 'fs'
import * as fsPromises from 'fs/promises'
import { Stream } from 'stream'
import { Response } from 'express'
import { QueryStorageDto } from './dto/query-storage.dto'

jest.mock('fs')
jest.mock('fs/promises')

describe('StoragesService', () => {
    let service: StoragesService
    let entityManager: EntityManager
    let dataSource: DataSource
    let repository: Repository<Storage>

    const mockStorageUrl = 'http://localhost:3000/storage'

    const mockEntityManager = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
    }

    const mockDataSource = {
        transaction: jest
            .fn()
            .mockImplementation((cb: (manager: EntityManager) => Promise<unknown>) =>
                cb(mockEntityManager as unknown as jest.Mocked<EntityManager>),
            ),
    }

    const mockRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
        exists: jest.fn(),
    }

    const mockConfigService = {
        get: jest.fn((key: string) => {
            if (key === 'common.storageDir') return 'storage'
            if (key === 'common.storageUrl') return mockStorageUrl
            return null
        }),
    }

    beforeEach(async () => {
        jest.clearAllMocks()
        ;(fs.existsSync as jest.Mock).mockReturnValue(true)
        ;(fs.mkdirSync as jest.Mock).mockReturnValue(undefined)
        ;(fs.createReadStream as jest.Mock).mockReturnValue(new Stream())
        ;(fsPromises.writeFile as jest.Mock).mockResolvedValue(undefined)

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StoragesService,
                {
                    provide: getRepositoryToken(Storage),
                    useValue: mockRepository,
                },
                {
                    provide: DataSource,
                    useValue: mockDataSource,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile()

        service = module.get<StoragesService>(StoragesService)
        entityManager = mockEntityManager as unknown as EntityManager
        dataSource = module.get<DataSource>(DataSource)
        repository = module.get<Repository<Storage>>(getRepositoryToken(Storage))
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('createFolder', () => {
        const createFolderDto = { dir: 'uploads', name: 'images' }

        it('should create a folder successfully', async () => {
            const expectedStorage = {
                id: '1',
                filename: 'images',
                folder: 'uploads',
                isFolder: true,
            } as Storage

            mockRepository.exists.mockResolvedValue(false) // Folder does not exist
            mockEntityManager.findOne.mockResolvedValue(null) // Parent check
            mockEntityManager.create.mockReturnValue(expectedStorage)
            mockEntityManager.save.mockResolvedValue(expectedStorage)

            const result = await service.createFolder(createFolderDto)

            expect(dataSource.transaction).toHaveBeenCalled()
            expect(entityManager.create).toHaveBeenCalledWith(
                Storage,
                expect.objectContaining({
                    filename: createFolderDto.name,
                    folder: createFolderDto.dir,
                    isFolder: true,
                }),
            )
            expect(result).toEqual(expectedStorage)
        })

        it('should throw ConflictException if folder already exists', async () => {
            mockRepository.exists.mockResolvedValue(true)

            await expect(service.createFolder(createFolderDto)).rejects.toThrow(ConflictException)
        })

        it('should handle parent directory validation', async () => {
            const dto = { dir: 'parent/child', name: 'new' }

            mockRepository.exists.mockResolvedValue(false)
            // Mock parent found but is a file
            mockEntityManager.findOne.mockResolvedValue({ isFolder: false } as Storage)

            await expect(service.createFolder(dto)).rejects.toThrow(ForbiddenException)
        })
    })

    describe('upload', () => {
        const mockFile = {
            originalname: 'test.jpg',
            mimetype: 'image/jpeg',
            size: 1024,
            buffer: Buffer.from('test'),
        } as Express.Multer.File
        const uploadDto = { dir: 'uploads' }

        it('should upload a new file successfully', async () => {
            const expectedStorage = {
                id: '1',
                filename: 'test.jpg',
                isFolder: false,
            } as Storage

            mockEntityManager.findOne.mockResolvedValue(null)
            mockEntityManager.create.mockReturnValue(expectedStorage)
            mockEntityManager.save.mockResolvedValue(expectedStorage)

            const result = await service.upload(mockFile, uploadDto)

            expect(entityManager.create).toHaveBeenCalled()
            expect(fsPromises.writeFile).toHaveBeenCalled()
            expect(result).toEqual(expectedStorage)
        })

        it('should update existing file', async () => {
            const existingStorage = {
                id: '1',
                filename: 'test.jpg',
                size: 500,
                isFolder: false,
            } as Storage

            // Mock existing file found
            mockEntityManager.findOne.mockImplementation((_entity, opts: any) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                if (opts?.where?.filename === 'test.jpg') return Promise.resolve(existingStorage)
                return Promise.resolve(null)
            })
            mockEntityManager.save.mockResolvedValue({ ...existingStorage, size: 1024 } as Storage)

            await service.upload(mockFile, uploadDto)

            expect(existingStorage.size).toBe(1024)
            expect(entityManager.save).toHaveBeenCalledWith(existingStorage)
            expect(fsPromises.writeFile).toHaveBeenCalled()
        })

        it('should throw ConflictException if uploading over a folder', async () => {
            const folderStorage = {
                id: '1',
                filename: 'test.jpg',
                isFolder: true,
            } as Storage

            mockEntityManager.findOne.mockResolvedValue(folderStorage)

            await expect(service.upload(mockFile, uploadDto)).rejects.toThrow(ConflictException)
        })

        it('should throw InternalServerErrorException if disk write fails', async () => {
            mockEntityManager.findOne.mockResolvedValue(null)
            mockEntityManager.create.mockReturnValue({} as Storage)
            mockEntityManager.save.mockResolvedValue({ id: '1' } as Storage)
            ;(fsPromises.writeFile as jest.Mock).mockRejectedValue(new Error('Disk error'))

            await expect(service.upload(mockFile, uploadDto)).rejects.toThrow(InternalServerErrorException)
        })
    })

    describe('findAll', () => {
        it('should return all storages with search query', async () => {
            const queryDto = { search: 'test', dir: 'uploads' }
            const expectedResult = [{ id: 1, filename: 'test.jpg' }]

            mockRepository.find.mockResolvedValue(expectedResult)

            const result = await service.findAll(queryDto)

            expect(repository.find).toHaveBeenCalledWith(
                expect.objectContaining({
                    take: 20,
                }),
            )
            expect(result).toEqual(expectedResult)
        })

        it('should return storages in directory', async () => {
            const queryDto = { dir: 'uploads' } as QueryStorageDto
            const expectedResult = [{ id: 1, filename: 'file.txt' }]

            mockRepository.find.mockResolvedValue(expectedResult)

            const result = await service.findAll(queryDto)

            expect(repository.find).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { folder: 'uploads' },
                }),
            )
            expect(result).toEqual(expectedResult)
        })
    })

    describe('streamFile', () => {
        const res = {
            set: jest.fn(),
            // pipe handled by stream mock
        } as unknown as Response

        it('should stream file successfully', async () => {
            const storage = {
                id: 1,
                filename: 'test.jpg',
                folder: 'uploads',
                isFolder: false,
                mimeType: 'image/jpeg',
                size: 1024,
            }
            const path = 'uploads/test.jpg'

            mockRepository.findOne.mockResolvedValue(storage)
            const streamMock = { pipe: jest.fn() }
            ;(fs.createReadStream as jest.Mock).mockReturnValue(streamMock)

            await service.streamFile(res, path)

            expect(res.set).toHaveBeenCalledWith('Content-Type', 'image/jpeg')
            expect(fs.createReadStream).toHaveBeenCalled()

            expect(streamMock.pipe).toHaveBeenCalledWith(res)
        })

        it('should throw NotFoundException if file not found', async () => {
            mockRepository.findOne.mockResolvedValue(null)

            await expect(service.streamFile(res, 'unknown.jpg')).rejects.toThrow(NotFoundException)
        })

        it('should throw NotFoundException if path is a folder', async () => {
            const storage = { isFolder: true }
            mockRepository.findOne.mockResolvedValue(storage)

            await expect(service.streamFile(res, 'folder')).rejects.toThrow(NotFoundException)
        })
    })
})
