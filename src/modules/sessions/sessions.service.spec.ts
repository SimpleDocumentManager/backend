import { Test, TestingModule } from '@nestjs/testing'
import { SessionsService } from './sessions.service'
import { UsersService } from '../users/users.service'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { UnauthorizedException } from '@nestjs/common'
import { LoginDto } from './dto/login.dto'
import { User } from '../users/entities/user.entity'

const mockUsersService = {
    findByUsername: jest.fn(),
    validatePassword: jest.fn(),
}

const mockJwtService = {
    sign: jest.fn(),
}

const mockConfigService = {
    getOrThrow: jest.fn(),
}

describe('SessionsService', () => {
    let service: SessionsService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SessionsService,
                { provide: UsersService, useValue: mockUsersService },
                { provide: JwtService, useValue: mockJwtService },
                { provide: ConfigService, useValue: mockConfigService },
            ],
        }).compile()

        service = module.get<SessionsService>(SessionsService)

        jest.clearAllMocks()
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('login', () => {
        const loginDto: LoginDto = {
            username: 'testuser',
            password: 'password123',
        }

        const mockUser = {
            id: 'user-id',
            username: 'testuser',
            password: 'hashedpassword',
        } as User

        it('should return tokens when credentials are valid', async () => {
            mockUsersService.findByUsername.mockResolvedValue(mockUser)
            mockUsersService.validatePassword.mockResolvedValue(true)
            mockConfigService.getOrThrow.mockReturnValue('secret')
            mockJwtService.sign.mockReturnValue('token')

            const result = await service.login(loginDto)

            expect(mockUsersService.findByUsername).toHaveBeenCalledWith(loginDto.username)
            expect(mockUsersService.validatePassword).toHaveBeenCalledWith(loginDto.password, mockUser.password)
            expect(mockJwtService.sign).toHaveBeenCalledTimes(2) // access and refresh tokens
            expect(result).toHaveProperty('accessToken')
            expect(result).toHaveProperty('refreshToken')
        })

        it('should throw UnauthorizedException if user not found', async () => {
            mockUsersService.findByUsername.mockResolvedValue(null)

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException)
            expect(mockUsersService.findByUsername).toHaveBeenCalledWith(loginDto.username)
            expect(mockUsersService.validatePassword).not.toHaveBeenCalled()
        })

        it('should throw UnauthorizedException if password is invalid', async () => {
            mockUsersService.findByUsername.mockResolvedValue(mockUser)
            mockUsersService.validatePassword.mockResolvedValue(false)

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException)
            expect(mockUsersService.findByUsername).toHaveBeenCalledWith(loginDto.username)
            expect(mockUsersService.validatePassword).toHaveBeenCalledWith(loginDto.password, mockUser.password)
        })
    })

    describe('refreshToken', () => {
        it('should return a new access token', () => {
            const userId = 'user-id'
            const username = 'testuser'

            mockConfigService.getOrThrow.mockReturnValue('secret')
            mockJwtService.sign.mockReturnValue('new-access-token')

            const result = service.refreshToken(userId, username)

            expect(mockJwtService.sign).toHaveBeenCalled()
            expect(result).toEqual({ accessToken: 'new-access-token' })
        })
    })
})
