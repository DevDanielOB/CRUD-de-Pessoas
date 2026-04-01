import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TelemetryInterceptor } from './telemetry.interceptor';
import { TelemetryService } from './telemetry.service';

@Module({
  providers: [
    TelemetryService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TelemetryInterceptor,
    },
  ],
  exports: [TelemetryService],
})
export class TelemetryModule {}
