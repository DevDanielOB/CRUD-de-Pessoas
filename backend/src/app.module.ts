import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma.module';
import { PeopleModule } from './modules/people/people.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { TelemetryModule } from './common/telemetry.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../.env'],
    }),
    PrismaModule,
    AuthModule,
    TelemetryModule,
    PeopleModule,
    HealthModule,
  ],
})
export class AppModule {}
