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

  // Identitas perusahaan untuk kop faktur. Default aman bila tabel kosong.
  async get() {
    const row = await this.config.find({ order: { id: 'ASC' }, take: 1 });
    const c = row[0];
    return {
      perusahaan: c?.perusahaan ?? '',
      alamat: c?.alamat ?? '',
      telp: c?.telp ?? '',
      logo: c?.logo ?? '',
    };
  }
}
