import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';

function makeUser(over: Partial<User> = {}): User {
  return {
    id: 1,
    username: 'admin',
    password: '123456',
    fullname: 'Admin',
    isActive: '1',
    foto: '',
    lastLogin: null,
    isAdmin: 1,
    ...over,
  };
}

// Bangun AuthService dengan dependensi mock. `upgrade` mengatur flag rehash.
function makeService(user: User | null, upgrade = false) {
  const usersRepo = {
    findOne: jest.fn(async () => user),
    update: jest.fn(async (_criteria: any, _data: any) => ({})),
  };
  const logsRepo = { insert: jest.fn(async () => ({})) };
  const jwt = { signAsync: jest.fn(async () => 'token') };
  const config = {
    get: jest.fn((key: string, def: string) =>
      key === 'AUTH_UPGRADE_PLAINTEXT' ? (upgrade ? 'true' : 'false') : def,
    ),
  };
  const service = new AuthService(
    usersRepo as any,
    logsRepo as any,
    jwt as any,
    config as any,
  );
  return { service, usersRepo, logsRepo, jwt };
}

describe('AuthService', () => {
  it('menerima password plaintext lama yang cocok (flag rehash off, tidak menulis ulang)', async () => {
    const { service, usersRepo } = makeService(makeUser({ password: '123456' }));
    const user = await service.validateUser('admin', '123456');
    expect(user.id).toBe(1);
    // Tidak boleh ada update password saat flag off.
    expect(usersRepo.update).not.toHaveBeenCalled();
  });

  it('me-rehash plaintext ke bcrypt saat flag upgrade on', async () => {
    const { service, usersRepo } = makeService(
      makeUser({ password: '123456' }),
      true,
    );
    await service.validateUser('admin', '123456');
    expect(usersRepo.update).toHaveBeenCalledTimes(1);
    const arg = (usersRepo.update.mock.calls[0]?.[1] ?? {}) as {
      password?: string;
    };
    expect(arg.password).toMatch(/^\$2[aby]\$/); // hash bcrypt
  });

  it('menerima password yang sudah berbentuk hash bcrypt', async () => {
    const hash = await bcrypt.hash('rahasia', 4);
    const { service } = makeService(makeUser({ password: hash }));
    const user = await service.validateUser('admin', 'rahasia');
    expect(user.id).toBe(1);
  });

  it('menolak password salah → Unauthorized', async () => {
    const { service } = makeService(makeUser({ password: '123456' }));
    await expect(service.validateUser('admin', 'salah')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('menolak user nonaktif → Unauthorized', async () => {
    const { service } = makeService(makeUser({ isActive: '0' }));
    await expect(
      service.validateUser('admin', '123456'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('menolak user tidak ditemukan → Unauthorized', async () => {
    const { service } = makeService(null);
    await expect(service.validateUser('x', 'y')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
