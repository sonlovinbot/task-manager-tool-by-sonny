interface Props {
  count: number
  skipped: number
  onMerge(): void
  onReplace(): void
  onCancel(): void
}

export function ImportDialog({ count, skipped, onMerge, onReplace, onCancel }: Props) {
  return (
    <div className="dialog" role="dialog" aria-label="Nhập dữ liệu">
      <p>
        Sẽ nhập {count} việc{skipped > 0 ? ` (bỏ qua ${skipped} mục không hợp lệ)` : ''}.
      </p>
      <button onClick={onMerge}>Gộp</button>
      <button onClick={onReplace}>Thay thế</button>
      <button onClick={onCancel}>Huỷ</button>
    </div>
  )
}
