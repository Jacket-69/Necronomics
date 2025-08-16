import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    // The @Body() decorator tells NestJS to parse the request body
    // and validate it against our RegisterDto.
    return this.authService.register(registerDto);
  }
}
