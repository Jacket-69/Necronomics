import { IsDateString, IsNotEmpty } from 'class-validator';

// This DTO defines the shape of the query parameters for the summary endpoint.
export class GetSummaryDto {
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}