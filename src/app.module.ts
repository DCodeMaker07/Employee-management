import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis, { Keyv } from '@keyv/redis';
import { CacheableMemory } from 'cacheable';
import { EmployeesModule } from './employees/employees.module';
import { PrismaService } from './prisma.service';
import { SeedModule } from './seed/seed.module';
import { envs } from './config/envs';

@Module({
  imports: [
    // Rate Limit
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 10,
        }
      ]
    }),
    // Redis
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
            new KeyvRedis(envs.redisUrl)
          ]
        }
      }
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
