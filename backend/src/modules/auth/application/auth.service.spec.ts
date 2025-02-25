import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserRepository } from '../infrastructure/repositories/user.repository';
import { Logger, NotFoundException } from '@nestjs/common';
import { UserEntity } from '../domain/entities/user.entity';
describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<UserRepository>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = new UserEntity(
    'user-123',
    'test@example.com',
    'Test',
    'User',
    'picture.jpg',
    'google',
    'google-123',
  );

  const mockUserRepository = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: 'IUserRepository',
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        Logger,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get('IUserRepository');
    jwtService = module.get(JwtService);
  });

  describe('findOrCreateUser', () => {
    const googleProfile = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      picture: 'picture.jpg',
      id: 'google-123',
    };

    it('should find existing user and return token', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.findOrCreateUser(googleProfile);

      expect(result).toEqual({
        user: mockUser.toJSON(),
        access_token: 'jwt-token',
      });
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should create new user if not found', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.findOrCreateUser(googleProfile);

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: googleProfile.email,
        firstName: googleProfile.firstName,
        lastName: googleProfile.lastName,
        picture: googleProfile.picture,
        provider: 'google',
        providerId: googleProfile.id,
      });
      expect(result.access_token).toBe('jwt-token');
    });
  });

  describe('findUserById', () => {
    it('should return user if found', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findUserById('user-123');
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(service.findUserById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
