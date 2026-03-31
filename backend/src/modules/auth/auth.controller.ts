import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtService } from './jwt.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly jwtService: JwtService) {}

  @Post('token')
  @ApiOperation({ summary: 'Gerar token JWT para acesso à API' })
  @ApiResponse({ status: 201, description: 'Token JWT gerado com sucesso' })
  createToken() {
    const token = this.jwtService.sign({
      sub: 'api-client',
      scope: ['people:read', 'people:write'],
    });

    return {
      token,
      type: 'Bearer',
    };
  }
}
