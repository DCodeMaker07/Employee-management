import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
  imports: [
    JwtModule.registerAsync({
      imports: [ ConfigModule ],
      inject: [ ConfigService ],
      useFactory: ( configService: ConfigService ) => {
        if (!configService.get('JWT_SECRET')) throw new Error(`There is not 'JWT_SECRET' initialized`);

        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '1h'
          }
        }
      }
    })
  ]
})
export class AuthModule {}
