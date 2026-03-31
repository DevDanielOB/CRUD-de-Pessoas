import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';

type JwtPayload = Record<string, unknown>;

@Injectable()
export class JwtService {
  constructor(private readonly configService: ConfigService) {}

  sign(payload: JwtPayload): string {
    const secret = this.getSecret();
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '1h');
    const header = { alg: 'HS256', typ: 'JWT' };
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const exp = nowInSeconds + this.parseExpiresIn(expiresIn);

    const payloadWithExp = {
      ...payload,
      iat: nowInSeconds,
      exp,
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payloadWithExp));
    const signature = this.createSignature(`${encodedHeader}.${encodedPayload}`, secret);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  verify(token: string): JwtPayload {
    const secret = this.getSecret();
    const [headerPart, payloadPart, signaturePart] = token.split('.');

    if (!headerPart || !payloadPart || !signaturePart) {
      throw new UnauthorizedException('Token JWT inválido');
    }

    const expectedSignature = this.createSignature(`${headerPart}.${payloadPart}`, secret);
    if (expectedSignature !== signaturePart) {
      throw new UnauthorizedException('Assinatura JWT inválida');
    }

    const payload = JSON.parse(this.base64UrlDecode(payloadPart)) as JwtPayload;
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const exp = Number(payload.exp);

    if (!Number.isFinite(exp) || exp <= nowInSeconds) {
      throw new UnauthorizedException('Token JWT expirado');
    }

    return payload;
  }

  private getSecret(): string {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new UnauthorizedException('JWT_SECRET não configurado');
    }
    return secret;
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = /^(\d+)([smhd])$/.exec(expiresIn.trim());
    if (!match) {
      return 3600;
    }

    const value = Number(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 3600;
    }
  }

  private createSignature(data: string, secret: string): string {
    return createHmac('sha256', secret).update(data).digest('base64url');
  }

  private base64UrlEncode(data: string): string {
    return Buffer.from(data).toString('base64url');
  }

  private base64UrlDecode(data: string): string {
    return Buffer.from(data, 'base64url').toString('utf8');
  }
}
