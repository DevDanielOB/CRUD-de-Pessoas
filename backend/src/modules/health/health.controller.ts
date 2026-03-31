import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../common/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

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
    };
  }
}