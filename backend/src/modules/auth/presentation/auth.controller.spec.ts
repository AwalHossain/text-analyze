/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { AuthService } from '../application/auth.service';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    findOrCreateUser: jest.fn(),
    findUserById: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
    getOrThrow: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('googleAuthRedirect', () => {
    it('should redirect with access token and user data', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
      };
      const mockAccessToken = 'mock-token';
      const mockReq = {
        user: {
          id: '123',
          email: 'test@example.com',
        },
      };
      const mockRes = {
        send: jest.fn(),
      } as unknown as Response;

      mockAuthService.findOrCreateUser.mockResolvedValue({
        user: mockUser,
        access_token: mockAccessToken,
      });

      process.env.FRONTEND_URL = 'http://localhost:8080';

      await controller.googleAuthRedirect(mockReq as any, mockRes);

      expect(mockRes.send).toHaveBeenCalledWith(
        expect.stringContaining('AUTH_SUCCESS'),
      );
      expect(mockRes.send).toHaveBeenCalledWith(
        expect.stringContaining(mockAccessToken),
      );
      expect(mockRes.send).toHaveBeenCalledWith(
        expect.stringContaining(JSON.stringify(mockUser)),
      );
    });
  });

  describe('getUser', () => {
    it('should return user data', async () => {
      const mockUserId = '123';
      const mockUser = {
        id: mockUserId,
        email: 'test@example.com',
        toJSON: () => ({
          id: mockUserId,
          email: 'test@example.com',
        }),
      };

      mockAuthService.findUserById.mockResolvedValue(mockUser);

      const result = await controller.getUser(mockUserId);

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'User fetched successfully',
        user: mockUser.toJSON(),
      });
      expect(mockAuthService.findUserById).toHaveBeenCalledWith(mockUserId);
    });

    it('should handle user not found', async () => {
      const mockUserId = '123';
      mockAuthService.findUserById.mockRejectedValue(
        new Error('User not found'),
      );

      await expect(controller.getUser(mockUserId)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('googleAuth', () => {
    it('should initiate Google OAuth2', async () => {
      const result = await controller.googleAuth();
      expect(result).toBeUndefined();
    });
  });
});
