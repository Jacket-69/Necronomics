import { Body, Controller, Post, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt/jwt.guard';
import type { Request } from 'express';

// By using declaration merging, we are telling TypeScript that the Request
// object from Express can have a 'user' property with our specific payload shape.
// This solves the "Property 'user' does not exist" error globally and safely.
declare module 'express' {
  export interface Request {
    user?: {
      sub: string;
      email: string;
    };
  }
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    // Thanks to the Guard, the user payload is now attached to the request
    return req.user;
  }
}
