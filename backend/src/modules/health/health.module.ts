import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma.module';
import { TelemetryModule } from '../../common/telemetry.module';
import { HealthController } from './health.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule, TelemetryModule],
  controllers: [HealthController],
})
export class HealthModule {}
