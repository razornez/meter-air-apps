import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Response } from 'express';
import { MeterService } from './meter.service';

// Penyajian foto bukti meteran — publik (tanpa JWT), setara perilaku
// static file `/uploads/*` sebelumnya. Foto diambil dari BLOB di DB.
@SkipThrottle()
@Controller('meter-photo')
export class MeterPhotoController {
  constructor(private readonly meter: MeterService) {}

  // GET /api/meter-photo/:noFaktur  → stream gambar
  @Get(':noFaktur')
  async serve(@Param('noFaktur') noFaktur: string, @Res() res: Response) {
    const decoded = decodeURIComponent(noFaktur);
    const photo = await this.meter.getPhoto(decoded);
    if (!photo) throw new NotFoundException('Foto tidak ditemukan');

    res.setHeader('Content-Type', photo.mime || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // cache 1 hari
    res.end(photo.data);
  }
}
