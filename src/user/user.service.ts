import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../src/auth/auth.service';
import { UpdateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private config: ConfigService, private authService: AuthService) {}

  async updateUser(userId: number, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...dto,
      },
    });

    delete user.hash;

    return user;
  }
}
