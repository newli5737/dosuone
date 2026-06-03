import type { PaginationMeta } from '../utils/format';

type Props = {
  meta: PaginationMeta;
  onPage: (page: number) => void;
};

export default function Pagination({ meta, onPage }: Props) {
  if (meta.total_pages <= 1) return null;
  return (
    <div className="pagination">
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        disabled={meta.page <= 1}
        onClick={() => onPage(meta.page - 1)}
      >
        ← Trước
      </button>
      <span className="pagination-info">
        Trang {meta.page} / {meta.total_pages} · {meta.total} mục
      </span>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        disabled={meta.page >= meta.total_pages}
        onClick={() => onPage(meta.page + 1)}
      >
        Sau →
      </button>
    </div>
  );
}
