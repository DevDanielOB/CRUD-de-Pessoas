import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { JwtService } from './jwt.service';

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [JwtService],
  exports: [JwtService],
})
export class AuthModule {}
