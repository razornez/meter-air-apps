import { partitionWorklist } from './worklist.util';

describe('partitionWorklist', () => {
  const customers = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];

  it('memisahkan pending vs done sesuai set tercatat', () => {
    const recorded = new Set(['2', '4']);
    const { pending, done } = partitionWorklist(customers, recorded);
    expect(pending.map((c) => c.id)).toEqual([1, 3]);
    expect(done).toBe(2);
  });

  it('semua tercatat → pending kosong', () => {
    const recorded = new Set(['1', '2', '3', '4']);
    const { pending, done } = partitionWorklist(customers, recorded);
    expect(pending).toHaveLength(0);
    expect(done).toBe(4);
  });

  it('tidak ada tercatat → semua pending', () => {
    const { pending, done } = partitionWorklist(customers, new Set());
    expect(pending).toHaveLength(4);
    expect(done).toBe(0);
  });
});
