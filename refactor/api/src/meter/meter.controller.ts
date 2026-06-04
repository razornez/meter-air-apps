import {
  BadRequestException, Body, Controller, Param, Post, Request,
  UploadedFile, UseGuards, UseInterceptors,
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
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('meter')
export class MeterController {
  private readonly uploadDir: string;

  constructor(
    private readonly meter: MeterService,
    private readonly ocr: OcrService,
    private readonly config: ConfigService,
  ) {
    this.uploadDir = this.config.get<string>('UPLOAD_DIR', 'uploads/foto_meter');
  }

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
    const faktur = await this.meter.attachPhotoFilename(decoded, req.tenantId);
    await fs.mkdir(this.uploadDir, { recursive: true });
    const filename = faktur.fotoMeter ?? `pic_${faktur.id}.jpeg`;
    await fs.writeFile(join(this.uploadDir, filename), file.buffer);
    return { filename, path: `/${this.uploadDir}/${filename}` };
  }
}
