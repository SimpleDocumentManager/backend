import { User } from 'src/modules/users/entities/user.entity'
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm'

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

    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn({ name: 'uploader_id' })
    uploader: User

    @Column({ name: 'uploader_id', type: 'varchar', length: 36 })
    uploaderId: string

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date
}
