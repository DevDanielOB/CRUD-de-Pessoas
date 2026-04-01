import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { JwtService } from './jwt.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [JwtService, JwtAuthGuard],
  exports: [JwtService, JwtAuthGuard],
})
export class AuthModule {}
