import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeDto } from './create-employee.dto';
import { IsNumber, IsPositive } from 'class-validator';

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
    
    @IsNumber()
    @IsPositive()
    id: number;

}
