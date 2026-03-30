import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { KnowledgeBase, FileType } from './knowledge-base.entity';

@Injectable()
export class KnowledgeBaseService {
  private supabase;

  constructor(
    @InjectRepository(KnowledgeBase)
    private kbRepo: Repository<KnowledgeBase>,
    private config: ConfigService,
  ) {
    this.supabase = createClient(
      this.config.get<string>('supabase.url')!,
      this.config.get<string>('supabase.serviceRoleKey')!,
    );
  }

  async upload(
    file: Express.Multer.File,
    uploadedById: string,
    dto: { title: string; description?: string; category?: string; language?: string },
  ) {
    const bucket = this.config.get<string>('supabase.storageBucket');
    const fileName = `${Date.now()}-${file.originalname}`;

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(fileName, file.buffer, { contentType: file.mimetype });

    if (error) throw new Error(`Supabase upload failed: ${error.message}`);

    const { data: urlData } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    const ext = file.originalname.split('.').pop()?.toUpperCase();
    const fileType =
      ext === 'PDF'
        ? FileType.PDF
        : ['JPG', 'JPEG', 'PNG', 'WEBP'].includes(ext || '')
        ? FileType.IMAGE
        : ['MP4', 'MOV'].includes(ext || '')
        ? FileType.VIDEO
        : FileType.DOCUMENT;

    const kb = this.kbRepo.create({
      ...dto,
      fileUrl: urlData.publicUrl,
      fileType,
      uploadedById,
    });

    return { data: await this.kbRepo.save(kb) };
  }

  async findAll(category?: string) {
    const where = category ? { category } : {};
    return { data: await this.kbRepo.find({ where, order: { createdAt: 'DESC' } }) };
  }

  async findOne(id: string) {
    const kb = await this.kbRepo.findOne({ where: { id } });
    if (!kb) throw new NotFoundException('Resource not found');
    return { data: kb };
  }

  async remove(id: string) {
    const kb = await this.kbRepo.findOne({ where: { id } });
    if (!kb) throw new NotFoundException('Resource not found');
    await this.kbRepo.remove(kb);
    return { message: 'Resource deleted successfully' };
  }
}
