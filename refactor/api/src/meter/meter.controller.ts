import {
  BadRequestException, Body, Controller, Param, Post, Request,
  UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MeterService } from './meter.service';
import { OcrService } from './ocr.service';
import { CalculateDto } from './dto/calculate.dto';
import { CreateReadingDto } from './dto/create-reading.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('meter')
export class MeterController {
  constructor(
    private readonly meter: MeterService,
    private readonly ocr: OcrService,
  ) {}

  @Post('calculate')
  calculate(@CurrentUser() user: AuthUser, @Body() dto: CalculateDto) {
    return this.meter.calculate(dto.tipe, dto.pemakaian);
  }

  @Post('readings')
  create(@CurrentUser() user: AuthUser, @Request() req, @Body() dto: CreateReadingDto) {
    return this.meter.saveReading(user.id, dto.customerId, dto.meterBaru, dto.catatan, req.tenantId);
  }

  @Post('ocr')
  @UseInterceptors(
    FileInterceptor('photo', {
      limits: { fileSize: 8 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!/^image\//.test(file.mimetype)) return cb(new BadRequestException('File harus berupa gambar'), false);
        cb(null, true);
      },
    }),
  )
  async recognizeMeter(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File foto wajib diunggah');
    return this.ocr.recognizeMeter(file.buffer);
  }

  @Post('readings/:noFaktur/photo')
  @UseInterceptors(
    FileInterceptor('photo', {
      limits: { fileSize: 8 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!/^image\//.test(file.mimetype)) return cb(new BadRequestException('File harus berupa gambar'), false);
        cb(null, true);
      },
    }),
  )
  async uploadPhoto(@Request() req, @Param('noFaktur') noFaktur: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File foto wajib diunggah');
    const decoded = decodeURIComponent(noFaktur);
    // Pastikan faktur ada & milik tenant ini (juga set flag foto_meter saat saveReading).
    const faktur = await this.meter.attachPhotoFilename(decoded, req.tenantId);

    // Simpan BLOB ke DB — persisten lintas redeploy (Railway FS ephemeral).
    await this.meter.savePhoto(decoded, req.tenantId, file.buffer, file.mimetype || 'image/jpeg');

    return { ok: true, noFaktur: decoded, fotoMeter: faktur.fotoMeter };
  }
}
