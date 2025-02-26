import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

interface GoogleProfile {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  id: string;
}

class AuthResponseDto {
  access_token: string;
  user: {
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
  };
}

type JwtPayload = {
  email: string;
  userId: string;
};

// Add this DTO for direct authentication
class DirectAuthDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsString()
  lastName?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  @IsString()
  picture?: string;
}

export { AuthResponseDto, DirectAuthDto, GoogleProfile, JwtPayload };

