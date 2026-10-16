import type { Priority, Status } from '../../domain/task'

export const STATUS_LABEL: Record<Status, string> = {
  todo: 'Cần làm',
  doing: 'Đang làm',
  done: 'Đã xong',
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  high: 'Cao',
  medium: 'Trung bình',
  low: 'Thấp',
}
