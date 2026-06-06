import { ConflictException } from '@nestjs/common';
import { MeterService } from './meter.service';

function makeService(meterInfo: any) {
  const dataSource = { transaction: jest.fn() };
  const tariff = { calculate: jest.fn(async () => ({ posts: [], totalBiaya: 0 })) };
  const customersService = { meterInfo: jest.fn(async () => meterInfo) };
  const config = { get: jest.fn((_k: string, d: string) => d) };
  const fakturRepo = { findOne: jest.fn() };
  const photoRepo = { findOne: jest.fn(), save: jest.fn(), update: jest.fn() };
  const service = new MeterService(
    dataSource as any,
    tariff as any,
    customersService as any,
    config as any,
    fakturRepo as any,
    photoRepo as any,
  );
  return { service, dataSource };
}

describe('MeterService.saveReading', () => {
  it('menolak bila pelanggan sudah dicatat bulan ini (ConflictException)', async () => {
    const { service, dataSource } = makeService({
      customer: { id: 1, tipe: 'B' },
      lastMeter: 100,
      alreadyRecordedThisMonth: true,
    });

    await expect(service.saveReading(1, 1, 125, undefined, 1)).rejects.toBeInstanceOf(
      ConflictException,
    );
    // Tidak boleh menyentuh DB bila ditolak guard.
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });
});


