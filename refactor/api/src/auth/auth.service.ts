import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { Tenant } from './entities/tenant.entity';
import { ActivityLog } from './entities/activity-log.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  // Selama app CI3 lama masih jalan paralel, JANGAN rehash password.
  // Set AUTH_UPGRADE_PLAINTEXT=true saat cutover.
  private readonly upgradePlaintext: boolean;

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Tenant) private readonly tenants: Repository<Tenant>,
    @InjectRepository(ActivityLog)
    private readonly logs: Repository<ActivityLog>,
    private readonly jwt: JwtService,
    config: ConfigService,
  ) {
    this.upgradePlaintext =
      config.get<string>('AUTH_UPGRADE_PLAINTEXT', 'false') === 'true';
  }

  /**
   * Verifikasi password dengan migrasi mulus dari plaintext (data lama) ke bcrypt.
   */
  private async verifyAndUpgradePassword(
    user: User,
    plain: string,
  ): Promise<boolean> {
    const stored = user.password ?? '';
    const looksHashed = /^\$2[aby]\$/.test(stored);

    if (looksHashed) {
      return bcrypt.compare(plain, stored);
    }

    if (stored === plain) {
      if (this.upgradePlaintext) {
        const hash = await bcrypt.hash(plain, 10);
        await this.users.update({ id: user.id }, { password: hash });
      }
      return true;
    }
    return false;
  }

  async login(dto: LoginDto) {
    // Step 1: Cari dan validasi tenant berdasarkan kode
    const tenant = await this.tenants.findOne({
      where: { kode: dto.kode.toUpperCase().trim() },
    });

    if (!tenant) {
      throw new UnauthorizedException('Kode perusahaan tidak ditemukan');
    }

    if (tenant.status === 'nonaktif') {
      throw new ForbiddenException('Akses perusahaan ini dinonaktifkan');
    }

    // Cek expired + grace period
    if (tenant.expiredAt) {
      const batasAkhir = new Date(tenant.expiredAt);
      batasAkhir.setDate(batasAkhir.getDate() + (tenant.gracePeriodDays ?? 7));
      if (new Date() > batasAkhir) {
        throw new ForbiddenException('TENANT_EXPIRED');
      }
    }

    // Step 2: Cari user yang di-scope ke tenant ini
    const user = await this.users.findOne({
      where: {
        username: dto.username,
        tenantId: tenant.id,
      },
    });

    if (!user || user.isActive !== 1) {
      throw new UnauthorizedException('Username atau password salah');
    }

    const ok = await this.verifyAndUpgradePassword(user, dto.password);
    if (!ok) {
      throw new UnauthorizedException('Username atau password salah');
    }

    // Step 3: Update last_login dan last_activity tenant
    await Promise.all([
      this.users.update({ id: user.id }, { lastLogin: new Date() }),
      this.tenants.update({ id: tenant.id }, { lastActivityAt: new Date() }),
    ]);

    await this.writeLog(user.id, tenant.id, 'Berhasil Login');

    // Step 4: Hitung sisa hari langganan
    const sisaHari = tenant.expiredAt
      ? Math.ceil(
          (new Date(tenant.expiredAt).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        )
      : null;

    const payload = {
      sub: user.id,
      username: user.username,
      tenant_id: tenant.id,
      tenant_kode: tenant.kode,
    };

    return {
      access_token: await this.jwt.signAsync(payload),
      user: this.toProfile(user),
      tenant: {
        id: tenant.id,
        nama: tenant.nama,
        kode: tenant.kode,
        expired_at: tenant.expiredAt,
        sisa_hari: sisaHari,
        dalam_grace_period: sisaHari !== null && sisaHari < 0,
      },
    };
  }

  async writeLog(idUser: number, tenantId: number, aktivitas: string, jenis = 'aktivitas') {
    await this.logs.insert({
      idUser,
      tenantId,
      aktivitas,
      jenis,
      waktu: new Date(),
    });
  }

  async profileById(id: number) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new UnauthorizedException();
    return this.toProfile(user);
  }

  private toProfile(user: User) {
    return {
      id: user.id,
      username: user.username,
      fullname: user.fullname,
      foto: user.foto,
      isAdmin: user.isAdmin === 1,
      lastLogin: user.lastLogin,
    };
  }
}
