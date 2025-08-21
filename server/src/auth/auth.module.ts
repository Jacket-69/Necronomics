import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      global: true, // Make the JWT service available globally
      secret: process.env.JWT_SECRET, //s Use the secret from our .env file
      signOptions: { expiresIn: '60m' }, // Tokens will expire in 60 minutes
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
