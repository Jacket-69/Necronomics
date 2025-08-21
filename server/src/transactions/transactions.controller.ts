import { Controller, Post, Body, UseGuards, Req, Get, Param, Patch, Delete } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import type { Request } from 'express';

declare module 'express' {
  export interface Request {
    user?: {
      sub: string;
      email: string;
    };
  }
}

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto, @Req() req: Request) {
    const userId = req.user!.sub;
    return this.transactionsService.create(createTransactionDto, userId);
  }

  @Get()
  findAll(@Req() req: Request) {
    const userId = req.user!.sub;
    return this.transactionsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') transactionId: string, @Req() req: Request) {
    const userId = req.user!.sub;
    return this.transactionsService.findOne(transactionId, userId);
  }

  @Patch(':id')
  update(
    @Param('id') transactionId: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @Req() req: Request,
  ) {
    const userId = req.user!.sub;
    return this.transactionsService.update(
      transactionId,
      updateTransactionDto,
      userId,
    );
  }

  @Delete(':id')
  remove(@Param('id') transactionId: string, @Req() req: Request) {
    const userId = req.user!.sub;
    return this.transactionsService.remove(transactionId, userId);
  }
}
