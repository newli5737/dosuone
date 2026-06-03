import * as fs from 'fs';
import * as path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { SOURCE_IMAGES } from './definitions';

export type CloudinaryAsset = { url: string; public_id: string };

const CACHE_FILE = path.join(__dirname, '../../seed/cloudinary-cache.json');

function initCloudinary() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error('Thiếu CLOUDINARY_* trong backend/.env');
  }
  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
}

function loadCache(): Record<string, CloudinaryAsset> {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')) as Record<string, CloudinaryAsset>;
    }
  } catch {
    /* ignore corrupt cache */
  }
  return {};
}

function saveCache(cache: Record<string, CloudinaryAsset>) {
  const dir = path.dirname(CACHE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
}

async function downloadBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Tải ảnh thất bại ${url} → ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function uploadBuffer(key: string, buffer: Buffer): Promise<CloudinaryAsset> {
  const folder = process.env.CLOUDINARY_FOLDER ?? 'images';
  const publicId = `${folder}/dosuone-seed-${key}`;

  const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        overwrite: true,
        invalidate: true,
        resource_type: 'image',
      },
      (err, res) => {
        if (err || !res) reject(err ?? new Error(`Upload failed: ${key}`));
        else resolve(res);
      },
    );
    stream.end(buffer);
  });

  return { url: result.secure_url, public_id: result.public_id };
}

/** Tải từng ảnh nguồn, upload Cloudinary; dùng cache để seed lại nhanh */
export async function resolveAllMedia(force = false): Promise<Record<string, CloudinaryAsset>> {
  initCloudinary();
  const cache = force ? {} : loadCache();
  const keys = Object.keys(SOURCE_IMAGES);

  for (const key of keys) {
    if (cache[key]?.url && cache[key]?.public_id && !force) {
      console.log(`  ○ ${key} (cache)`);
      continue;
    }
    console.log(`  ↑ ${key} …`);
    const buffer = await downloadBuffer(SOURCE_IMAGES[key]);
    cache[key] = await uploadBuffer(key, buffer);
    saveCache(cache);
  }

  return cache;
}
