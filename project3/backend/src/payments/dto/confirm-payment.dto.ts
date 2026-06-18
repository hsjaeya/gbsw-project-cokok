import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsPositive } from 'class-validator';

export class ConfirmPaymentDto {
  @ApiProperty({ example: 'payment_key_from_toss' })
  @IsString()
  paymentKey: string;

  @ApiProperty({ example: 'order_uuid_123' })
  @IsString()
  orderId: string;

  @ApiProperty({ example: 10000 })
  @IsInt()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  courseId: number;
}
