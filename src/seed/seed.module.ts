import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { EmployeesModule } from 'src/employees/employees.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [EmployeesModule]
})
export class SeedModule {}
