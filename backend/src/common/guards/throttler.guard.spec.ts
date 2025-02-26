import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerException } from '@nestjs/throttler';
import { CustomThrottlerGuard } from './throttler.guard';

describe('CustomThrottlerGuard', () => {
  let guard: CustomThrottlerGuard;
  let configService: ConfigService;

  // Mock execution context
  const mockExecutionContext = () => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          ip: '127.0.0.1',
        }),
      }),
    } as unknown as ExecutionContext;
    return mockContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomThrottlerGuard,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key, defaultValue) => {
              const config = {
                'throttler.limit': 5,
                'throttler.ttl': 10000, // 10 seconds for faster testing
                'throttler.penaltyMs': 10000, // 10 seconds for faster testing
              };
              return config[key] !== undefined ? config[key] : defaultValue;
            }),
          },
        },
      ],
    }).compile();

    guard = module.get<CustomThrottlerGuard>(CustomThrottlerGuard);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    // Clear any intervals
    if (guard['cleanupInterval']) {
      clearInterval(guard['cleanupInterval']);
    }
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow requests within the limit', async () => {
    const context = mockExecutionContext();
    let result;
    // Make requests up to the limit
    for (let i = 0; i < 5; i++) {
      result = await guard.canActivate(context)
      expect(result).toBe(true);
    }
    try {
        await guard.canActivate(context);
        // If we get here, the test should fail
        fail('Expected ThrottlerException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ThrottlerException);
      }
  });

  it('should block requests that exceed the limit', async () => {
    const context = mockExecutionContext();
    
    // Make requests up to the limit
    for (let i = 0; i < 5; i++) {
      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    }
    try {
        await guard.canActivate(context);
        // If we get here, the test should fail
        fail('Expected ThrottlerException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ThrottlerException);
      }
  });

  it('should reset the counter after TTL expires', async () => {
    const context = mockExecutionContext();
    
    // Make requests up to the limit
    for (let i = 0; i < 5; i++) {
      await guard.canActivate(context);
    }
    
    // Mock Date.now to return a time after TTL has expired
    const originalDateNow = Date.now;
    const mockNow = originalDateNow() + 11000; // 11 seconds later (> TTL)
    global.Date.now = jest.fn(() => mockNow);
    
    try {
      // Should be allowed again after TTL
      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    } finally {
      // Restore original Date.now
      global.Date.now = originalDateNow;
    }
  });

  it('should keep blocking requests during penalty time', async () => {
    const context = mockExecutionContext();
    
    // Make requests up to the limit
    for (let i = 0; i < 5; i++) {
      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    }
    
    // The 6th request should throw ThrottlerException
    try {
        await guard.canActivate(context);
        fail('Expected ThrottlerException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ThrottlerException);
      }
    // Mock Date.now to return a time during penalty period
    const originalDateNow = Date.now;
    const mockNow = originalDateNow() + 5000; // 5 seconds later (< penalty time)
    global.Date.now = jest.fn(() => mockNow);
    
    try {
        try {
            await guard.canActivate(context);
            fail('Expected ThrottlerException to be thrown');
          } catch (error) {
            expect(error).toBeInstanceOf(ThrottlerException);
          }
    } finally {
      // Restore original Date.now
      global.Date.now = originalDateNow;
    }
  });

  it('should allow requests after penalty time expires', async () => {
    const context = mockExecutionContext();
    
    // Make requests exceeding the limit to trigger penalty
    for (let i = 0; i < 6; i++) {
      try {
        await guard.canActivate(context);
      } catch (error) {
        // Expected error on the 6th request
      }
    }
    
    // Mock Date.now to return a time after penalty period
    const originalDateNow = Date.now;
    const mockNow = originalDateNow() + 70000; // 70 seconds later (> penalty time)
    global.Date.now = jest.fn(() => mockNow);
    
    try {
      // Should be allowed again after penalty time
      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    } finally {
      // Restore original Date.now
      global.Date.now = originalDateNow;
    }
  });

  it('should handle requests with no IP address', async () => {
    const context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          ip: undefined,
        }),
      }),
    } as unknown as ExecutionContext;
    
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should track different IPs separately', async () => {
    // First IP
    const context1 = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          ip: '192.168.1.1',
        }),
      }),
    } as unknown as ExecutionContext;
    
    // Second IP
    const context2 = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          ip: '192.168.1.2',
        }),
      }),
    } as unknown as ExecutionContext;
    
    // Make requests up to the limit for first IP
    for (let i = 0; i < 5; i++) {
      await guard.canActivate(context1);
    }
    
  // First IP should be blocked on next request
  try {
    await guard.canActivate(context1);
    fail('Expected ThrottlerException to be thrown');
  } catch (error) {
    expect(error).toBeInstanceOf(ThrottlerException);
  }
    // Second IP should still be allowed
    const newresult = await guard.canActivate(context2);
    expect(newresult).toBe(true);
  });
}); 