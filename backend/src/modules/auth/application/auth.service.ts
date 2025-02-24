import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../domain/interfaces/user.repository.interface';
import { UserEntity } from '../domain/entities/user.entity';
import { AuthResponseDto } from '../domain/dto/auth.dto';
import { GoogleProfile } from '../domain/dto/auth.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly logger: Logger,
  ) {}

  async findOrCreateUser(profile: GoogleProfile): Promise<AuthResponseDto> {
    let user = await this.userRepository.findByEmail(profile.email);

    if (!user) {
      user = await this.userRepository.create({
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        picture: profile.picture,
        provider: 'google',
        providerId: profile.id,
      });
    }

    const payload = {
      email: user.email,
      userId: user.id,
      picture: user.picture,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      user: user.toJSON(),
      access_token,
    };
  }

  async findUserById(id: string): Promise<UserEntity> {
    this.logger.log(id, 'check id');
    const user = await this.userRepository.findById(id);
    console.log(user, 'check user');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
