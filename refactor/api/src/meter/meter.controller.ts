import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import { join } from 'path';
import { MeterService } from './meter.service';
import { OcrService } from './ocr.service';
import { CalculateDto } from './dto/calculate.dto';
import { CreateReadingDto } from './dto/create-reading.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  AuthUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('meter')
export class MeterController {
  private readonly uploadDir: string;

  constructor(
    private readonly meter: MeterService,
    private readonly ocr: OcrService,
    private readonly config: ConfigService,
  ) {
    this.uploadDir = this.config.get<string>(
      'UPLOAD_DIR',
      'uploads/foto_meter',
    );
  }

  // Preview rincian tarif (tanpa menyimpan).
  @Post('calculate')
  calculate(@Body() dto: CalculateDto) {
    return this.meter.calculate(dto.tipe, dto.pemakaian);
  }

  // Simpan catatan meter → buat faktur + history + transaksi.
  @Post('readings')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateReadingDto) {
    return this.meter.saveReading(
      user.id,
      dto.customerId,
      dto.meterBaru,
      dto.catatan,
    );
  }

  /**
   * OCR angka meter dari foto (Tesseract.js, gratis, self-hosted).
   * Kembalikan kandidat angka + best guess → mobile prefill input (editable).
   */
  @Post('ocr')
  @UseInterceptors(
    FileInterceptor('photo', {
      limits: { fileSize: 8 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!/^image\//.test(file.mimetype)) {
          return cb(new BadRequestException('File harus berupa gambar'), false);
        }
        cb(null, true);
      },
    }),
  )
  async recognizeMeter(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File foto wajib diunggah');
    return this.ocr.recognizeMeter(file.buffer);
  }

  // Upload foto meter untuk faktur tertentu (maks 8MB, hanya gambar).
  @Post('readings/:noFaktur/photo')
  @UseInterceptors(
    FileInterceptor('photo', {
      limits: { fileSize: 8 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!/^image\//.test(file.mimetype)) {
          return cb(new BadRequestException('File harus berupa gambar'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadPhoto(
    @Param('noFaktur') noFaktur: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('File foto wajib diunggah');

    const decoded = decodeURIComponent(noFaktur);
    const faktur = await this.meter.attachPhotoFilename(decoded);

    await fs.mkdir(this.uploadDir, { recursive: true });
    const filename = faktur.fotoMeter ?? `pic_${faktur.id}.jpeg`;
    await fs.writeFile(join(this.uploadDir, filename), file.buffer);

    return { filename, path: `/${this.uploadDir}/${filename}` };
  }
}
