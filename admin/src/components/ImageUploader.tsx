import { useRef, useState } from 'react';
import type { CloudinaryImage } from '../lib/cloudinary';
import { deleteFromCloudinary, uploadToCloudinary } from '../lib/cloudinary';

export type UploadItem = CloudinaryImage & { localKey: string };

type Props = {
  label: string;
  multiple?: boolean;
  value: UploadItem[];
  onChange: (items: UploadItem[]) => void;
};

export default function ImageUploader({ label, multiple = false, value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  const pickFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError('');
    setUploading(true);
    try {
      const list = multiple ? Array.from(files) : [files[0]];
      const uploaded: UploadItem[] = [];
      for (const file of list) {
        const img = await uploadToCloudinary(file);
        uploaded.push({ ...img, localKey: `${img.public_id}-${Date.now()}` });
      }
      onChange(multiple ? [...value, ...uploaded] : uploaded);
    } catch {
      setError('Upload thất bại. Kiểm tra preset Cloudinary.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const toggleSelect = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const removeSelected = async () => {
    if (!selected.size) return;
    const toRemove = value.filter((v) => selected.has(v.localKey));
    const ids = toRemove.map((v) => v.public_id);
    try {
      await deleteFromCloudinary(ids);
      onChange(value.filter((v) => !selected.has(v.localKey)));
      setSelected(new Set());
    } catch {
      setError('Xóa ảnh trên Cloudinary thất bại');
    }
  };

  const removeOne = async (item: UploadItem) => {
    try {
      await deleteFromCloudinary([item.public_id]);
      onChange(value.filter((v) => v.localKey !== item.localKey));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(item.localKey);
        return next;
      });
    } catch {
      setError('Không xóa được ảnh');
    }
  };

  const setPrimary = (key: string) => {
    const idx = value.findIndex((v) => v.localKey === key);
    if (idx <= 0) return;
    const next = [...value];
    const [item] = next.splice(idx, 1);
    next.unshift(item);
    onChange(next);
  };

  return (
    <div className="uploader">
      <div className="uploader-head">
        <span className="uploader-label">{label}</span>
        <div className="btn-group">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? 'Đang tải...' : multiple ? '+ Tải ảnh lên' : 'Tải ảnh lên'}
          </button>
          {multiple && selected.size > 0 && (
            <button type="button" className="btn btn-danger btn-sm" onClick={removeSelected}>
              Xóa đã chọn ({selected.size})
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        hidden
        onChange={(e) => pickFiles(e.target.files)}
      />
      {error && <p className="form-error">{error}</p>}
      {value.length === 0 ? (
        <p className="text-muted" style={{ fontSize: 13 }}>Chưa có ảnh. Bấm tải lên (Cloudinary).</p>
      ) : (
        <div className={multiple ? 'uploader-grid' : 'uploader-single'}>
          {value.map((item, index) => (
            <div
              key={item.localKey}
              className={`uploader-item ${selected.has(item.localKey) ? 'selected' : ''}`}
            >
              {multiple && (
                <label className="uploader-check">
                  <input
                    type="checkbox"
                    checked={selected.has(item.localKey)}
                    onChange={() => toggleSelect(item.localKey)}
                  />
                </label>
              )}
              <img src={item.url} alt="" />
              {multiple && index === 0 && <span className="uploader-badge">Ảnh bìa</span>}
              <div className="uploader-actions">
                {multiple && index > 0 && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPrimary(item.localKey)}>
                    Đặt bìa
                  </button>
                )}
                <button type="button" className="btn btn-danger btn-sm" onClick={() => removeOne(item)}>
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
