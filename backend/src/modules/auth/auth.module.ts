import { Logger, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './presentation/auth.controller';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { GoogleStrategy } from './infrastructure/strategies/google.strategy';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { UserSchema, User } from './infrastructure/schemas/user.schema';
import { AuthService } from './application/auth.service';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    UserRepository,
    Logger,
    GoogleStrategy,
    JwtStrategy,
    AuthService,
  ],
  exports: [AuthService, UserRepository],
})
export class AuthModule {}
