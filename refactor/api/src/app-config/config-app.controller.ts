import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ConfigAppService } from './config-app.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('config')
export class ConfigAppController {
  constructor(private readonly config: ConfigAppService) {}

  @Get()
  get(@Request() req) {
    return this.config.get(req.tenantId);
  }
}
