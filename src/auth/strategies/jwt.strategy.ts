import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from '../../prisma.service';
import { JwtPayload } from "../interfaces/jwt-payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ) {
    
    constructor(
        private readonly prismaService: PrismaService,
        configService: ConfigService,
    ) {
        super({
            secretOrKey: configService.get<string>('JWT_SECRET') || (() => {
                throw new Error('JWT_SECRET must be defined');
            })(),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }
    
    async validate(payload: JwtPayload) {
        const { id } = payload;

        const user = await this.prismaService.user.findFirst({
            where: { id },
            omit: { password: true }
        });

        if(!user) throw new UnauthorizedException('Token Not valid');

        if(!user.isActive) throw new UnauthorizedException('User is inactive, talk with an admin');

        return user;

    }

}