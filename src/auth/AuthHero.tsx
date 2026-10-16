import { ChartBar, CheckFat, ListChecks, Microphone } from '@phosphor-icons/react'

const FEATURES = [
  { Icon: ListChecks, title: 'Danh sách và trạng thái', text: 'Cần làm, Đang làm, Đã xong chỉ với một chạm.' },
  { Icon: ChartBar, title: 'Báo cáo tiến độ', text: 'Biết việc nào gấp và tuần này bạn xong bao nhiêu.' },
  { Icon: Microphone, title: 'Nhập bằng giọng nói', text: 'Nói tiếng Việt, app ghi lại thành việc.' },
]

export function AuthHero() {
  return (
    <div className="auth-hero">
      <div className="brand-mark">
        <i>
          <CheckFat size={18} weight="fill" aria-hidden />
        </i>
        Quản lý công việc
      </div>
      <div>
        <h2 className="auth-hero-title">Việc của bạn, gọn gàng và rõ ràng.</h2>
        <ul className="auth-features">
          {FEATURES.map(({ Icon, title, text }) => (
            <li key={title}>
              <span className="gicon">
                <Icon size={20} aria-hidden />
              </span>
              <div>
                <b>{title}</b>
                <span>{text}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
