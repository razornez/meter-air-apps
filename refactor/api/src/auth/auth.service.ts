import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { ActivityLog } from './entities/activity-log.entity';

@Injectable()
export class AuthService {
  // Selama app CI3 lama masih jalan paralel, JANGAN rehash password (akan
  // memutus login app lama). Set AUTH_UPGRADE_PLAINTEXT=true saat cutover.
  private readonly upgradePlaintext: boolean;

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
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
   * - Jika password DB sudah berbentuk hash bcrypt → bandingkan via bcrypt.
   * - Jika masih plaintext (data warisan CI3) & cocok → terima, lalu rehash ke bcrypt.
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

    // Data lama: password masih plaintext.
    if (stored === plain) {
      if (this.upgradePlaintext) {
        const hash = await bcrypt.hash(plain, 10);
        await this.users.update({ id: user.id }, { password: hash });
      }
      return true;
    }
    return false;
  }

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.users.findOne({ where: { username } });
    if (!user || user.isActive !== '1') {
      throw new UnauthorizedException('Username atau password salah');
    }
    const ok = await this.verifyAndUpgradePassword(user, password);
    if (!ok) {
      throw new UnauthorizedException('Username atau password salah');
    }
    return user;
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);

    await this.users.update({ id: user.id }, { lastLogin: new Date() });
    await this.writeLog(user.id, 'Berhasil Login');

    const payload = { sub: user.id, username: user.username };
    return {
      access_token: await this.jwt.signAsync(payload),
      user: this.toProfile(user),
    };
  }

  async writeLog(idUser: number, aktivitas: string, jenis = 'aktivitas') {
    await this.logs.insert({
      idUser,
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
