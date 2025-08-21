    import { TransactionType } from '@prisma/client';
    import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

    export class CreateTransactionDto {
      @IsNumber()
      @IsNotEmpty()
      amount: number;

      @IsString()
      @IsNotEmpty()
      description: string;

      @IsEnum(TransactionType)
      @IsNotEmpty()
      type: TransactionType;

      @IsDateString()
      @IsNotEmpty()
      date: string;
    }
    