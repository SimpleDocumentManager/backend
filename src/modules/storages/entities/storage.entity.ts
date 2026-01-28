import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm'

@Entity('storages')
@Unique(['folder', 'filename'])
export class Storage {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ name: 'filename' })
    filename: string

    @Index()
    @Column({ name: 'folder' })
    folder: string

    @Column({ name: 'full_url' })
    fullUrl: string

    @Column({ name: 'mime_type' })
    mimeType: string

    @Column({ name: 'is_folder' })
    isFolder: boolean

    @Column({ name: 'size' })
    /** Size of the file in bytes. */
    size: number

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date
}
