import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

import { ApiBody, ApiExcludeEndpoint, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User as UserDecorator } from 'src/modules/auth/decorators/user.decorator';
import { AuthService } from '../application/auth.service';
import { DirectAuthDto, GoogleProfile } from '../domain/dto/auth.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')

export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}
  
  @ApiExcludeEndpoint()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Google OAuth2 redirect
  }

  
   @ApiOperation({ 
    summary: 'Google OAuth callback - not directly callable from Swagger',
    description: 'This endpoint receives the callback from Google after authentication. It cannot be triggered directly from Swagger UI.'
  })
  @ApiExcludeEndpoint()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const { user, access_token } = await this.authService.findOrCreateUser(
      req.user as GoogleProfile,
    );

    res.send(`
      <script>
        window.opener.postMessage({
          type: 'AUTH_SUCCESS',
          data: {
            access_token: '${access_token}',
            user: ${JSON.stringify(user)}
          }
        }, '${process.env.FRONTEND_URL}');
        window.close();
      </script>
    `);
  }

  @ApiOperation({ 
    summary: 'Get Access Token for testing',
    description: 'Authenticate directly with email and user details (simulates Google login)'
  })
  @ApiBody({ type: DirectAuthDto })
  @Post('direct-auth')
  async directAuth(@Body() authData: DirectAuthDto) {
    // Create a profile similar to what Google would provide
    const profile: GoogleProfile = {
      email: authData.email,
      firstName: authData.firstName,
      lastName: authData.lastName || '',
      picture: authData.picture || "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535a69d87131574f1028d5_peep-75.png",
      id: `direct-${Date.now()}` // Generate a unique ID for this auth method
    };

    this.logger.log(profile, 'check profile');
    
    const { user, access_token } = await this.authService.findOrCreateUser(profile);
    
    return {
      statusCode: HttpStatus.OK,
      message: 'Authentication successful',
      data: { 
        user,
        access_token 
      }
    };
  }
  

  @ApiOperation({ summary: 'Get current user information' })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getUser(@UserDecorator('userId') userId: string) {
    const user = await this.authService.findUserById(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'User fetched successfully',
      user: user.toJSON(),
    };
  }
}
