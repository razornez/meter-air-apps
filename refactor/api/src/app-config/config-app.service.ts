import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppConfig } from './app-config.entity';

@Injectable()
export class ConfigAppService {
  constructor(
    @InjectRepository(AppConfig)
    private readonly config: Repository<AppConfig>,
  ) {}

  async get(tenantId = 1) {
    let row = await this.config.findOne({ where: { tenantId }, order: { id: 'ASC' } });
    if (!row) {
      row = await this.config.save(
        this.config.create({ tenantId, perusahaan: 'Meter Air', telp: '', alamat: '' }),
      );
    }
    return {
      perusahaan: row.perusahaan ?? '',
      alamat: row.alamat ?? '',
      telp: row.telp ?? '',
      logo: row.logo ?? '',
    };
  }
}
