interface Props {
  count: number
  skipped: number
  onMerge(): void
  onReplace(): void
  onCancel(): void
}

export function ImportDialog({ count, skipped, onMerge, onReplace, onCancel }: Props) {
  return (
    <div className="overlay-dialog">
      <div className="dialog" role="dialog" aria-label="Nhập dữ liệu">
        <b style={{ fontSize: 17 }}>Nhập dữ liệu</b>
        <p className="t-small">
          Sẽ nhập {count} việc{skipped > 0 ? ` (bỏ qua ${skipped} mục không hợp lệ)` : ''}.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn accent" onClick={onMerge}>
            Gộp
          </button>
          <button className="btn" onClick={onReplace}>
            Thay thế
          </button>
          <button className="btn ghost" onClick={onCancel}>
            Huỷ
          </button>
        </div>
      </div>
    </div>
  )
}
