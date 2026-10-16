import { translateAuthError } from './authErrors'

describe('translateAuthError', () => {
  it.each([
    [{ code: 'invalid_credentials', message: 'Invalid login credentials' }, 'Email hoặc mật khẩu chưa đúng.'],
    [{ message: 'Email not confirmed' }, 'Email chưa được xác nhận. Hãy mở thư xác nhận rồi đăng nhập lại.'],
    [{ code: 'user_already_exists' }, 'Email này đã có tài khoản. Hãy chuyển sang Đăng nhập.'],
    [{ code: 'weak_password' }, 'Mật khẩu quá yếu. Hãy dùng ít nhất 8 ký tự, gồm cả chữ và số.'],
    [{ status: 429 }, 'Bạn thử quá nhiều lần. Hãy đợi vài phút rồi thử lại.'],
    [{ message: 'TypeError: Failed to fetch' }, 'Không kết nối được tới máy chủ. Hãy kiểm tra mạng rồi thử lại.'],
    [{ code: 'same_password' }, 'Mật khẩu mới phải khác mật khẩu cũ.'],
  ])('maps %j', (err, expected) => {
    expect(translateAuthError(err)).toBe(expected)
  })

  it('falls back to a generic message and never leaks the raw error', () => {
    const msg = translateAuthError({ message: 'pg: relation "x" does not exist' })
    expect(msg).toBe('Có lỗi xảy ra. Hãy thử lại sau.')
    expect(translateAuthError(undefined)).toBe('Có lỗi xảy ra. Hãy thử lại sau.')
  })
})
