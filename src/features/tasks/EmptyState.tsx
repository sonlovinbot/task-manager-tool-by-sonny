import { ArrowCounterClockwise, ListChecks, MagnifyingGlass } from '@phosphor-icons/react'

interface Props {
  filtered: boolean
  onClear(): void
}

export function EmptyState({ filtered, onClear }: Props) {
  return (
    <div className="empty">
      <div className="ring">
        {filtered ? <MagnifyingGlass size={34} aria-hidden /> : <ListChecks size={34} aria-hidden />}
      </div>
      <b style={{ fontSize: 17 }}>{filtered ? 'Không có việc nào khớp' : 'Danh sách đang trống'}</b>
      <p className="t-small" style={{ maxWidth: '34ch' }}>
        {filtered
          ? 'Thử bỏ bớt bộ lọc, hoặc tìm bằng từ khoá khác.'
          : 'Gõ việc đầu tiên vào ô phía trên, hoặc bấm micro và nói.'}
      </p>
      {filtered && (
        <button className="btn" onClick={onClear}>
          <ArrowCounterClockwise size={16} aria-hidden />
          Xoá bộ lọc
        </button>
      )}
    </div>
  )
}
