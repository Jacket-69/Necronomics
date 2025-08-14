import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // This makes the module global
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Export the service to be used in other modules
})
export class PrismaModule {}
