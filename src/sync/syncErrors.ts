interface ErrorLike {
  code?: string
  message?: string
  status?: number
}

/** Short Vietnamese explanations of why a write or read against Supabase failed. */
export function translateSyncError(err: unknown): string {
  const e = (err ?? {}) as ErrorLike
  const code = e.code ?? ''
  const msg = (e.message ?? '').toLowerCase()

  if (code === '42P01' || code === 'PGRST205' || msg.includes('could not find the table'))
    return 'Chưa có bảng tasks trên Supabase. Hãy chạy supabase/schema.sql trong SQL Editor.'
  if (code === '42703' || code === 'PGRST204' || msg.includes('column'))
    return 'Cấu trúc bảng tasks chưa khớp với ứng dụng. Hãy chạy lại supabase/schema.sql.'
  if (code === '42501' || msg.includes('row-level security'))
    return 'Supabase từ chối ghi dữ liệu (RLS). Hãy kiểm tra các policy trong supabase/schema.sql.'
  if (code === 'PGRST301' || e.status === 401 || msg.includes('jwt'))
    return 'Phiên đăng nhập đã hết hạn. Hãy đăng xuất rồi đăng nhập lại.'
  if (code === '23514' || msg.includes('check constraint'))
    return 'Dữ liệu việc không hợp lệ so với quy tắc của bảng (ví dụ tiêu đề trống).'
  if (msg.includes('failed to fetch') || msg.includes('network') || msg.includes('load failed'))
    return 'Mất kết nối. Việc của bạn vẫn an toàn trên máy và sẽ tự đồng bộ khi có mạng.'
  return `Không đồng bộ được${code ? ` (mã ${code})` : ''}. Hãy thử lại sau.`
}
