import { Module } from '@nestjs/common';
import { EmployeesModule } from './employees/employees.module';
import { PrismaService } from './prisma.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { SeedModule } from './seed/seed.module';

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
    SeedModule,
  ],
  controllers: [],
  providers: [
    PrismaService
  ],
})
export class AppModule {}
