import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../common/prisma.service';
import { TelemetryService } from '../../common/telemetry.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly telemetryService: TelemetryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Verificar saúde da aplicação e banco de dados' })
  @ApiResponse({ status: 200, description: 'Status da aplicação e banco' })
  async checkHealth() {
    const timestamp = new Date().toISOString();
    let databaseStatus = 'connected';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      databaseStatus = 'disconnected';
    }

    return {
      status: databaseStatus === 'connected' ? 'ok' : 'error',
      timestamp,
      database: databaseStatus,
      telemetry: this.telemetryService.getSummary(),
    };
  }

  @Get('metrics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Consultar métricas simples da aplicação' })
  @ApiResponse({ status: 200, description: 'Métricas em memória da aplicação' })
  @ApiResponse({ status: 401, description: 'Token JWT não informado ou inválido' })
  getMetrics() {
    return this.telemetryService.getDetailedMetrics();
  }
}
