import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  create(createTransactionDto: CreateTransactionDto, userId: string) {
    return this.prisma.transaction.create({
      data: {
        ...createTransactionDto,
        userId: userId,
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.transaction.findMany({
      where: {
        userId: userId,
      },
    });
  }

  async findOne(transactionId: string, userId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: {
        id: transactionId,
      },
    });

    if (!transaction || transaction.userId !== userId) {
      throw new ForbiddenException('Access to resource denied');
    }

    return transaction;
  }

  async update(
    transactionId: string,
    updateTransactionDto: UpdateTransactionDto,
    userId: string,
  ) {
    await this.findOne(transactionId, userId);

    return this.prisma.transaction.update({
      where: {
        id: transactionId,
      },
      data: {
        ...updateTransactionDto,
      },
    });
  }

  async remove(transactionId: string, userId: string) {
    // First, verify ownership
    await this.findOne(transactionId, userId);

    // If verification passes, delete the transaction
    return this.prisma.transaction.delete({
      where: {
        id: transactionId,
      },
    });
  }

  async getSummary(userId: string, startDate: Date, endDate: Date) {
    const totalIncomeResult = await this.prisma.transaction.aggregate({
      where: {
        userId: userId,
        type: 'INCOME',
        date: {
          gte: startDate, // gte = Greater Than or Equal to
          lte: endDate, // lte = Less Than or Equal to
        },
      },
      _sum: {
        amount: true,
      },
    });

    const totalExpensesResult = await this.prisma.transaction.aggregate({
      where: {
        userId: userId,
        type: 'EXPENSE',
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const totalIncome = totalIncomeResult._sum.amount || 0;
    const totalExpenses = totalExpensesResult._sum.amount || 0;
    const balance = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      balance,
    };
  }

}
