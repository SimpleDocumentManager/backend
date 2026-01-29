import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { compare as bcryptCompare } from 'bcrypt'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async findByUsername(username: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: { username },
            select: { id: true, username: true, password: true },
        })
    }

    async findById(id: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } })
    }

    async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcryptCompare(plainPassword, hashedPassword)
    }
}
