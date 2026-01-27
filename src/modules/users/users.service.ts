import { Injectable, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { User } from './entities/user.entity'
import { CreateUserDto } from './dto/create-user.dto'

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async create(dto: CreateUserDto): Promise<User> {
        const existingUser = await this.findByUsername(dto.username)
        if (existingUser) {
            throw new ConflictException('Username already exists')
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10)
        const user = this.userRepository.create({
            ...dto,
            password: hashedPassword,
        })

        return this.userRepository.save(user)
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { username } })
    }

    async findById(id: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } })
    }

    async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword)
    }
}
