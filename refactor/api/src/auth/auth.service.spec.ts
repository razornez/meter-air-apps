import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { Tenant } from './entities/tenant.entity';

function makeUser(over: Partial<User> = {}): User {
  return Object.assign(new User(), {
    id: 1, tenantId: 1, username: 'admin', password: '123456',
    fullname: 'Admin', isActive: 1, foto: null, lastLogin: null, isAdmin: 1,
    ...over,
  });
}

function makeTenant(over: Partial<Tenant> = {}): Tenant {
  return Object.assign(new Tenant(), {
    id: 1, nama: 'BUMDes', slug: 'bumdes', kode: 'BUMDES-KRK', token: 'tok',
    expiredAt: null, gracePeriodDays: 7, status: 'aktif', paket: 'basic',
    lastActivityAt: null, createdAt: null, updatedAt: null,
    ...over,
  });
}

function buildService(users: User[], tenants: Tenant[], upgrade = false): AuthService {
  const usersRepo = { findOne: jest.fn(), update: jest.fn() } as any;
  const tenantsRepo = { findOne: jest.fn(), update: jest.fn() } as any;
  const logsRepo = { insert: jest.fn() } as any;
  const jwtSvc = { signAsync: jest.fn().mockResolvedValue('token') } as any;
  const configSvc = { get: jest.fn().mockReturnValue(upgrade ? 'true' : 'false') } as any;
  usersRepo.findOne.mockResolvedValue(users[0] ?? null);
  tenantsRepo.findOne.mockResolvedValue(tenants[0] ?? null);
  return new AuthService(usersRepo, tenantsRepo, logsRepo, jwtSvc, configSvc);
}

describe('AuthService.login', () => {
  it('login berhasil dengan plaintext', async () => {
    const user = makeUser({ password: '123456', isActive: 1 });
    const tenant = makeTenant();
    const svc = buildService([user], [tenant]);
    const result = await svc.login({ username: 'admin', password: '123456', kode: 'BUMDES-KRK' });
    expect(result.access_token).toBe('token');
    expect(result.tenant.kode).toBe('BUMDES-KRK');
  });

  it('login berhasil dengan bcrypt', async () => {
    const hash = await bcrypt.hash('secret', 10);
    const user = makeUser({ password: hash, isActive: 1 });
    const tenant = makeTenant();
    const svc = buildService([user], [tenant]);
    const result = await svc.login({ username: 'admin', password: 'secret', kode: 'BUMDES-KRK' });
    expect(result.access_token).toBe('token');
  });

  it('throw jika kode tenant tidak ditemukan', async () => {
    const svc = buildService([], []);
    await expect(svc.login({ username: 'admin', password: '123456', kode: 'WRONG' }))
      .rejects.toThrow(UnauthorizedException);
  });

  it('throw jika tenant nonaktif', async () => {
    const tenant = makeTenant({ status: 'nonaktif' });
    const svc = buildService([makeUser()], [tenant]);
    await expect(svc.login({ username: 'admin', password: '123456', kode: 'BUMDES-KRK' }))
      .rejects.toThrow(ForbiddenException);
  });

  it('throw jika password salah', async () => {
    const svc = buildService([makeUser({ isActive: 1 })], [makeTenant()]);
    await expect(svc.login({ username: 'admin', password: 'wrong', kode: 'BUMDES-KRK' }))
      .rejects.toThrow(UnauthorizedException);
  });

  it('throw jika user tidak aktif', async () => {
    const svc = buildService([makeUser({ isActive: 0 })], [makeTenant()]);
    await expect(svc.login({ username: 'admin', password: '123456', kode: 'BUMDES-KRK' }))
      .rejects.toThrow(UnauthorizedException);
  });
});
