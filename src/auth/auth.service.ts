import { BadRequestException, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) { }

  async register(createUserDto: CreateUserDto) {
    try {
      
      const { password, ...userData } = createUserDto;

      const user = await this.prisma.user.create({
        data: {
          ...userData,
          password: bcrypt.hashSync(password, 10)
        },
        omit: {
          password: true,
        }
      });

      return {
        ...user,
        token: this.getJwtToken({ id: user.id })
      }

    } catch (ex) {
      this.handleDBErrors(ex);
    }
  }

  async login( loginUserDto: LoginUserDto ) {
    
    const { email, password } = loginUserDto;

    try {
      
      const userExist = await this.prisma.user.findFirst({
        where: {
          email
        }
      });

      if (!userExist) throw new UnauthorizedException();

      if(!bcrypt.compareSync(password, userExist.password)) throw new UnauthorizedException(`Credentials are not valid`);

      return {
        id: userExist.id,
        email: userExist.email,
        fullName: userExist.fullName,
        isActive: userExist.isActive,
        roles: userExist.roles,
        token: this.getJwtToken({ id: userExist.id })
      }

    } catch (ex: any) {
      if(ex instanceof UnauthorizedException) {
        throw ex;
      }
      this.handleDBErrors(ex);
    }
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  private handleDBErrors(exception: any): never {

    if(exception.code === '23505'){
      throw new BadRequestException(exception.detail);
    }

    console.error(exception);

    throw new InternalServerErrorException(`Please check server logs`);

  }

}
