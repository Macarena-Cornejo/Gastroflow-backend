import { IsArray, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateOrderDto {
  @IsUUID()
  restaurant_id!: string;

  @IsUUID()
  table_id!: string;

  @IsUUID()
  @IsOptional()
  waiter_id?: string;

  @IsArray()
  items!: Array<{
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    observations?: string;
  }>;

  @IsNumber()
  total_amount!: number;

  @IsString()
  @IsOptional()
  observations?: string;
}
