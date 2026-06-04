import { NotFoundException } from '@nestjs/common';
import { FakturService } from './faktur.service';

function makeService(faktur: any) {
  const transaction = jest.fn(async (cb: any) => cb({ update: jest.fn() }));
  const dataSource = { transaction };
  const fakturRepo = {
    findOne: jest.fn(async () => faktur),
  };
  const logs = { insert: jest.fn(async (_entity: any) => ({})) };
  const pembayaran = {
    insert: jest.fn(async (_entity: any) => ({})),
    find: jest.fn(async () => []),
  };
  const noop = {} as any;
  const service = new FakturService(
    dataSource as any,
    fakturRepo as any,
    noop, // transaksi repo (tak dipakai di setLunas)
    noop, // history repo
    noop, // customer repo
    logs as any,
    pembayaran as any,
  );
  return { service, transaction, logs, fakturRepo, pembayaran };
}

describe('FakturService.setLunas', () => {
  it('melempar NotFound bila faktur tidak ada & tidak menyentuh DB', async () => {
    const { service, transaction, logs } = makeService(null);
    await expect(
      service.setLunas('FA/X', true, 1, 1),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(transaction).not.toHaveBeenCalled();
    expect(logs.insert).not.toHaveBeenCalled();
  });

  it('menandai lunas: dibayar = total, tulis audit log', async () => {
    const { service, transaction, logs } = makeService({
      id: 9,
      noFaktur: 'FA/BD/26/06/1',
      total: 65000,
    });
    const res = await service.setLunas('FA/BD/26/06/1', true, 7, 1);
    expect(res).toEqual({
      noFaktur: 'FA/BD/26/06/1',
      isLunas: true,
      dibayar: 65000,
    });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(logs.insert).toHaveBeenCalledTimes(1);
    expect(logs.insert.mock.calls[0]?.[0]).toMatchObject({
      idUser: 7,
      jenis: 'pembayaran',
    });
  });

  it('batal lunas: dibayar = 0', async () => {
    const { service } = makeService({ id: 9, noFaktur: 'FA/Y', total: 50000 });
    const res = await service.setLunas('FA/Y', false, 1, 1);
    expect(res.isLunas).toBe(false);
    expect(res.dibayar).toBe(0);
  });

  it('TD-5: mencatat riwayat pembayaran (jumlah=total, tipe=lunas)', async () => {
    const { service, pembayaran } = makeService({
      id: 9,
      noFaktur: 'FA/BD/26/06/1',
      total: 65000,
    });
    await service.setLunas('FA/BD/26/06/1', true, 7, 1);
    expect(pembayaran.insert).toHaveBeenCalledTimes(1);
    expect(pembayaran.insert.mock.calls[0]?.[0]).toMatchObject({ noFaktur: 'FA/BD/26/06/1', jumlah: 65000, status: 'lunas', petugas: 7 });
  });

  it('TD-5: gagal mencatat pembayaran TIDAK menggagalkan pelunasan (best-effort)', async () => {
    const { service, pembayaran } = makeService({
      id: 9,
      noFaktur: 'FA/Z',
      total: 1000,
    });
    pembayaran.insert.mockRejectedValueOnce(new Error("table 'pembayaran' missing"));
    // tetap sukses meski recording gagal
    const res = await service.setLunas('FA/Z', true, 1, 1);
    expect(res.isLunas).toBe(true);
  });
});



