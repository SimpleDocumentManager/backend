import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { TypeOrmModule } from '@nestjs/typeorm'
import { memoryStorage } from 'multer'
import { Storage } from './entities/storage.entity'
import { StoragesController } from './storages.controller'
import { StoragesService } from './storages.service'

@Module({
    imports: [
        TypeOrmModule.forFeature([Storage]),
        MulterModule.register({
            storage: memoryStorage(),
        }),
    ],
    controllers: [StoragesController],
    providers: [StoragesService],
    exports: [StoragesService],
})
export class StoragesModule {}
