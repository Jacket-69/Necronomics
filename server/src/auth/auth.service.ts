import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(dto: RegisterDto) {
    // Step 1: Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    // Step 2: Save the new user to the database
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash: hashedPassword,
          username: dto.username,
        },
      });

      // For security, don't return the hash in the response
      // We create a new object without the 'hash' property
      const { hash, ...userWithoutHash } = user;
      return userWithoutHash;
      
    } catch (error) {
      // Handle the case where the email is already taken
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002' // Unique constraint violation code
      ) {
        throw new ForbiddenException('Credentials taken');
      }
      throw error;
    }
  }
}
