import {
  Controller,
  Get,
  UseGuards,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { Request } from 'express';

import { GoogleProfile } from '../domain/dto/auth.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { User as UserDecorator } from 'src/modules/auth/decorators/user.decorator';
import { AuthService } from '../application/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Google OAuth2 redirect
  }

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

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getUser(@UserDecorator('userId') userId: string) {
    console.log(userId, 'check userId');
    const user = await this.authService.findUserById(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'User fetched successfully',
      user: user.toJSON(),
    };
  }
}
