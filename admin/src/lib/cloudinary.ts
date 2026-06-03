export type CloudinaryImage = {
  url: string;
  public_id: string;
};

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? 'dn00btmpw';
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? 'dosuone';
const folder = import.meta.env.VITE_CLOUDINARY_FOLDER ?? 'images';

export async function uploadToCloudinary(file: File): Promise<CloudinaryImage> {
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', uploadPreset);
  form.append('folder', folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Upload Cloudinary thất bại');
  }

  const data = await res.json();
  return {
    url: data.secure_url as string,
    public_id: data.public_id as string,
  };
}

import api from '../api';

export async function deleteFromCloudinary(publicIds: string[]) {
  if (!publicIds.length) return;
  await api.post('/admin/cloudinary/delete', { public_ids: publicIds });
}
