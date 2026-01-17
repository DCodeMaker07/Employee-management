import { Module } from '@nestjs/common';
import { EmployeesModule } from './employees/employees.module';
import { PrismaService } from './prisma.service';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        }
      ]
    }),
    EmployeesModule,
  ],
  controllers: [],
  providers: [
    PrismaService
  ],
})
export class AppModule {}
