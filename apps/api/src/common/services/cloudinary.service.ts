import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

export interface UploadResult {
  url: string;
  public_id: string;
  format: string;
  width?: number;
  height?: number;
  secure_url?: string;
}

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.cloudinaryName,
      api_key: this.configService.cloudinaryApiKey,
      api_secret: this.configService.cloudinaryApiSecret,
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `fab-o2o/${folder}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              url: result.secure_url,
              public_id: result.public_id,
              format: result.format,
              width: result.width,
              height: result.height,
              secure_url: result.secure_url,
            });
          }
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadResult> {
    return this.uploadImage(file, folder);
  }

  async uploadMerchantDocument(
    file: Express.Multer.File,
    userId: string,
    documentType: string,
  ): Promise<UploadResult> {
    const folder = `merchants/${userId}/${documentType}`;
    return this.uploadImage(file, folder);
  }

  async deleteImage(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  getImageUrl(publicId: string): string {
    return cloudinary.url(publicId, {
      secure: true,
    });
  }
}
