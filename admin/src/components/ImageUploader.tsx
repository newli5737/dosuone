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
      setError('Không tải được ảnh. Thử lại.');
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

  const detachItems = (keys: Set<string>) => {
    onChange(value.filter((v) => !keys.has(v.localKey)));
    setSelected((prev) => {
      const next = new Set(prev);
      for (const k of keys) next.delete(k);
      return next;
    });
    setError('');
  };

  const deleteRemote = async (publicIds: string[]) => {
    const ids = [...new Set(publicIds.map((id) => id?.trim()).filter(Boolean))];
    if (!ids.length) return true;
    try {
      await deleteFromCloudinary(ids);
      return true;
    } catch {
      return false;
    }
  };

  const removeSelected = async () => {
    if (!selected.size) return;
    const toRemove = value.filter((v) => selected.has(v.localKey));
    const keys = new Set(toRemove.map((v) => v.localKey));
    const remoteIds = toRemove.map((v) => v.public_id);
    const ok = await deleteRemote(remoteIds);
    if (ok) {
      detachItems(keys);
      return;
    }
    if (confirm('Không xóa được file trên máy chủ ảnh. Gỡ khỏi danh sách sản phẩm?')) {
      detachItems(keys);
    } else {
      setError('Chưa gỡ ảnh. Kiểm tra backend đang chạy và đăng nhập admin.');
    }
  };

  const removeOne = async (item: UploadItem) => {
    const key = new Set([item.localKey]);
    const ok = await deleteRemote([item.public_id]);
    if (ok) {
      detachItems(key);
      return;
    }
    if (confirm('Không xóa được file trên máy chủ ảnh. Gỡ khỏi danh sách sản phẩm?')) {
      detachItems(key);
    } else {
      setError('Chưa gỡ ảnh. Kiểm tra backend (port 3000) và cấu hình Cloudinary trong .env.');
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
      <div className={`uploader-head${label ? '' : ' uploader-head--actions-only'}`}>
        {label ? <span className="uploader-label">{label}</span> : null}
        <div className="btn-group">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? 'Đang tải...' : multiple ? 'Chọn ảnh' : 'Chọn ảnh'}
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
        <p className="text-muted uploader-empty">Chưa có ảnh</p>
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
              {multiple && index === 0 && <span className="uploader-badge">Đại diện</span>}
              <div className="uploader-actions">
                {multiple && index > 0 && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPrimary(item.localKey)}>
                    Đặt làm đại diện
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
