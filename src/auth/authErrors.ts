interface ErrorLike {
  message?: string
  code?: string
  status?: number
}

/** Map Supabase auth errors to short Vietnamese messages. */
export function translateAuthError(err: unknown): string {
  const e = (err ?? {}) as ErrorLike
  const code = e.code ?? ''
  const msg = (e.message ?? '').toLowerCase()

  if (code === 'invalid_credentials' || msg.includes('invalid login credentials'))
    return 'Email hoặc mật khẩu chưa đúng.'
  if (code === 'email_not_confirmed' || msg.includes('email not confirmed'))
    return 'Email chưa được xác nhận. Hãy mở thư xác nhận rồi đăng nhập lại.'
  if (code === 'user_already_exists' || msg.includes('already registered'))
    return 'Email này đã có tài khoản. Hãy chuyển sang Đăng nhập.'
  if (code === 'weak_password' || msg.includes('password should be'))
    return 'Mật khẩu quá yếu. Hãy dùng ít nhất 8 ký tự, gồm cả chữ và số.'
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit' || e.status === 429 || msg.includes('rate limit'))
    return 'Bạn thử quá nhiều lần. Hãy đợi vài phút rồi thử lại.'
  if (code === 'signup_disabled' || msg.includes('signups not allowed'))
    return 'Dự án đang tắt đăng ký tài khoản mới.'
  if (code === 'same_password' || msg.includes('different from the old password'))
    return 'Mật khẩu mới phải khác mật khẩu cũ.'
  if (msg.includes('failed to fetch') || msg.includes('network'))
    return 'Không kết nối được tới máy chủ. Hãy kiểm tra mạng rồi thử lại.'
  return 'Có lỗi xảy ra. Hãy thử lại sau.'
}
