import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  create(@Body() createAuthDto: CreateUserDto) {
    return this.authService.register(createAuthDto);
  }

  @Post('/signin')
  login( @Body() loginUserDto: LoginUserDto ){
    return this.authService.login(loginUserDto);
  }

}
