import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.config.get<string>('CLOUDINARY_API_SECRET'),
      secure: true,
    });
  }

  getPublicConfig() {
    return {
      cloud_name: this.config.get<string>('CLOUDINARY_CLOUD_NAME'),
      upload_preset: this.config.get<string>('CLOUDINARY_UPLOAD_PRESET'),
      folder: this.config.get<string>('CLOUDINARY_FOLDER') ?? 'images',
    };
  }

  async destroy(publicId: string): Promise<void> {
    if (!publicId?.trim()) return;
    try {
      await cloudinary.uploader.destroy(publicId, { invalidate: true });
    } catch (e) {
      this.logger.warn(`Cloudinary destroy failed: ${publicId}`, e);
    }
  }

  async destroyMany(publicIds: string[]): Promise<{ deleted: string[] }> {
    const ids = [...new Set(publicIds.map((id) => id?.trim()).filter(Boolean))] as string[];
    await Promise.all(ids.map((id) => this.destroy(id)));
    return { deleted: ids };
  }
}
