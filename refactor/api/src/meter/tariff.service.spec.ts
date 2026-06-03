import { TariffService } from './tariff.service';
import { LevelPemakaian } from './entities/level-pemakaian.entity';

// Data tarif tipe B (sesuai DB `pdam`): 7 level, tiap blok 10 m3.
function levelsB(): LevelPemakaian[] {
  const harga = [2000, 2500, 3000, 3500, 4000, 4500, 5000];
  return harga.map((h, i) => ({
    id: i + 1,
    jenis: 'B',
    level: i + 1,
    harga: h,
    perPemakaian: 10,
    perPemakaianMax: null,
  }));
}

// Mock Repository<LevelPemakaian> — hanya method find yang dipakai service.
function makeRepo(data: LevelPemakaian[]) {
  return {
    find: jest.fn(async ({ where }: any) =>
      data.filter((d) => d.jenis === where.jenis),
    ),
  } as any;
}

describe('TariffService (tarif berjenjang)', () => {
  let service: TariffService;

  beforeEach(() => {
    service = new TariffService(makeRepo(levelsB()));
  });

  it('0 m3 → total 0', async () => {
    const r = await service.calculate('B', 0);
    expect(r.totalBiaya).toBe(0);
  });

  it('5 m3 (≤ blok 1) → 5 × 2000 = 10000', async () => {
    const r = await service.calculate('B', 5);
    expect(r.totalBiaya).toBe(10000);
    expect(r.posts).toHaveLength(1);
    expect(r.posts[0]).toMatchObject({ level: 1, quantity: 5, total: 10000 });
  });

  it('25 m3 → 60000 (blok 1:10, 2:10, 3:5)', async () => {
    const r = await service.calculate('B', 25);
    expect(r.totalBiaya).toBe(60000);
    expect(r.posts).toEqual([
      { level: 1, harga: 2000, quantity: 10, total: 20000 },
      { level: 2, harga: 2500, quantity: 10, total: 25000 },
      { level: 3, harga: 3000, quantity: 5, total: 15000 },
    ]);
  });

  it('100 m3 → melimpah ke level tertinggi (semua sisa di level 7)', async () => {
    const r = await service.calculate('B', 100);
    // 6 blok penuh (10..6) + sisa 40 di level 7
    expect(r.totalBiaya).toBe(395000);
    const last = r.posts[r.posts.length - 1];
    expect(last).toMatchObject({ level: 7, quantity: 40, total: 200000 });
  });

  it('jenis tidak dikenal → total 0 & tanpa rincian', async () => {
    const r = await service.calculate('X', 50);
    expect(r.totalBiaya).toBe(0);
    expect(r.posts).toHaveLength(0);
  });

  it('pemakaian desimal dibulatkan ke bawah', async () => {
    const r = await service.calculate('B', 5.9);
    expect(r.totalBiaya).toBe(10000); // diperlakukan sebagai 5 m3
  });
});
