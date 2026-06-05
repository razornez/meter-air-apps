import { Controller, ForbiddenException, Post, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle } from '@nestjs/throttler';
import { SeedService } from './seed.service';

@SkipThrottle()
@Controller('seed')
export class SeedController {
  constructor(
    private readonly seed: SeedService,
    private readonly config: ConfigService,
  ) {}

  // POST /api/seed/demo?secret=XXX&tenant=1
  // Dilindungi SEED_SECRET env var — jangan expose ke publik tanpa secret
  @Post('demo')
  async demo(
    @Query('secret') secret: string,
    @Query('tenant') tenant = '1',
  ) {
    const expected = this.config.get<string>('SEED_SECRET', 'seed-meterair-demo-2025');
    if (secret !== expected) {
      throw new ForbiddenException('Invalid seed secret');
    }
    return this.seed.seedDemo(Number(tenant));
  }
}
