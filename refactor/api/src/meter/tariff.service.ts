import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LevelPemakaian } from './entities/level-pemakaian.entity';

export interface TariffBreakdownItem { level: number; harga: number; quantity: number; total: number; }
export interface TariffResult { posts: TariffBreakdownItem[]; totalBiaya: number; }

@Injectable()
export class TariffService {
  constructor(
    @InjectRepository(LevelPemakaian)
    private readonly levels: Repository<LevelPemakaian>,
  ) {}

  async calculate(jenis: string, pemakaian: number, tenantId = 1): Promise<TariffResult> {
    const data = await this.levels.find({
      where: { jenis, tenantId },
      order: { level: 'ASC' },
    });

    const posts: TariffBreakdownItem[] = [];
    if (data.length === 0) return { posts, totalBiaya: 0 };

    const levelMax = data[data.length - 1].level;
    let sisa = Math.max(0, Math.floor(pemakaian));

    for (const value of data) {
      if (sisa > value.perPemakaian) {
        if (value.level < levelMax) {
          posts.push({ level: value.level, harga: value.harga, quantity: value.perPemakaian, total: value.harga * value.perPemakaian });
          sisa -= value.perPemakaian;
        } else {
          posts.push({ level: value.level, harga: value.harga, quantity: sisa, total: value.harga * sisa });
        }
      } else if (sisa <= value.perPemakaian && sisa >= 0) {
        posts.push({ level: value.level, harga: value.harga, quantity: sisa, total: value.harga * sisa });
        sisa -= value.perPemakaian;
        if (sisa < 0) sisa = 0;
        break;
      }
    }

    return { posts, totalBiaya: posts.reduce((acc, p) => acc + p.total, 0) };
  }
}
