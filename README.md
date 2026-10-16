# Quản lý công việc

Ứng dụng web quản lý công việc cá nhân: danh sách việc, trạng thái (Cần làm, Đang làm, Đã xong), bộ lọc,
báo cáo, nhập bằng giọng nói tiếng Việt, xuất/nhập JSON, CSV, lịch `.ics`. Đăng nhập bằng email và đồng bộ
lên Supabase. Dữ liệu luôn ghi vào máy trước (hoạt động cả khi mất mạng), rồi tự đẩy lên máy chủ.

Công nghệ: React, Vite, TypeScript, Dexie (IndexedDB), Zustand, Supabase.

## Chạy trên máy

```bash
npm install
cp .env.example .env.local   # rồi điền 2 giá trị bên dưới
npm run dev
```

`.env.local` (không bao giờ commit):

| Biến | Lấy ở đâu |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase > Connect > Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase > Project Settings > API Keys > Publishable (hoặc `anon`) key |

Không dán khoá `service_role` hoặc `secret` vào đây. Mọi biến `VITE_` đều nằm trong mã JavaScript công khai.

Tạo bảng và quy tắc bảo mật: chạy [supabase/schema.sql](supabase/schema.sql) trong Supabase > SQL Editor.
Bật đăng ký email ở Authentication > Sign In / Providers.

Không có hai biến trên thì app chạy ở chế độ chỉ lưu trên máy, không có đăng nhập.

## Triển khai lên GitHub Pages

Workflow [deploy-pages.yml](.github/workflows/deploy-pages.yml) chạy test, build rồi xuất bản mỗi khi đẩy lên `main`.
Trang chạy tại `https://<tên-tài-khoản>.github.io/<tên-repo>/`.

Thiết lập một lần:

1. **Biến cho bản build.** GitHub > Settings > Secrets and variables > Actions > tab **Variables** > New repository variable:
   `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` (cùng giá trị như `.env.local`).
   Vite nhúng chúng lúc build, nên file `.env.local` trên máy bạn không được dùng trên GitHub.
   Workflow dừng với lỗi rõ ràng nếu thiếu, để không xuất bản nhầm một bản không có đăng nhập.
2. **Bật Pages.** Settings > Pages > Build and deployment > Source: **GitHub Actions**.
3. **Cho Supabase biết địa chỉ mới.** Supabase > Authentication > URL Configuration:
   - Site URL: `https://<tên-tài-khoản>.github.io/<tên-repo>/`
   - Redirect URLs: thêm `https://<tên-tài-khoản>.github.io/<tên-repo>/**` và giữ `http://localhost:5173/**` cho máy dev.

   Thiếu bước này, email xác nhận và email đặt lại mật khẩu sẽ đưa người dùng về `localhost`.

### Lưu ý bảo mật khi repo công khai

- Khoá `anon`/publishable nằm trong mã công khai của trang. Đó là thiết kế của Supabase, an toàn nhờ
  Row Level Security trong `schema.sql`: mỗi người chỉ đọc và ghi được việc của chính mình.
- Ai cũng có thể tự đăng ký nếu bạn bật đăng ký email. Cân nhắc bật xác nhận email, CAPTCHA hoặc giới hạn tốc độ
  ở Supabase nếu lo bị lạm dụng.

## Lệnh hữu ích

```bash
npm test         # chạy toàn bộ test
npm run build    # kiểm tra kiểu và build ra dist/
```

Muốn thử bản build với đường dẫn con như trên Pages: `BASE_PATH=/<tên-repo>/ npm run build`.
