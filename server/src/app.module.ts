import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule], // Import our new global module
  controllers: [],
  providers: [],
})
export class AppModule {}
