import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfig } from './app-config.entity';
import { ConfigAppService } from './config-app.service';
import { ConfigAppController } from './config-app.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AppConfig])],
  controllers: [ConfigAppController],
  providers: [ConfigAppService],
})
export class ConfigAppModule {}
