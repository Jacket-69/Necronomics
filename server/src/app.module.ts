import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [PrismaModule, AuthModule, TransactionsModule], // Import our new global module
  controllers: [],
  providers: [],
})
export class AppModule {}
