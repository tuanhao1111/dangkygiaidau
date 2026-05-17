# 🚀 HƯỚNG DẪN DEPLOY LÊN VERCEL

Form đăng ký giải đấu **"Tam huynh đệ trên một chiếc xe tăng"** - Bang Nhất Mộng & Rising Star

---

## 📋 TỔNG QUAN

Project gồm 2 phần:
1. **Frontend** (HTML/CSS/JS) → deploy lên **Vercel**
2. **Backend** (Google Apps Script) → kết nối với **Google Sheets** để lưu dữ liệu

---

## ⚙️ BƯỚC 1: TẠO GOOGLE SHEET & APPS SCRIPT

### 1.1. Tạo Google Sheet
1. Vào https://sheets.google.com
2. Tạo Sheet mới, đặt tên: **`Rising Star - Đăng ký`**
3. Đổi tên tab đầu tiên thành **`DangKy`** (không dấu, không có dấu cách)

### 1.2. Cài Google Apps Script
1. Trong Google Sheet vừa tạo, vào menu: **`Extensions`** → **`Apps Script`**
2. Xóa toàn bộ code mặc định
3. Mở file **`google-apps-script.js`** trong project, copy toàn bộ
4. Paste vào Apps Script editor
5. Nhấn **Ctrl+S** để lưu, đặt tên project tùy thích

### 1.3. Deploy Apps Script thành Web App
1. Trong Apps Script, click nút **`Deploy`** ở góc trên phải → **`New deployment`**
2. Click icon ⚙️ bên cạnh "Select type" → chọn **`Web app`**
3. Điền:
   - **Description**: Rising Star Registration API
   - **Execute as**: **`Me (your-email@gmail.com)`**
   - **Who has access**: **`Anyone`** ⚠️ Bắt buộc chọn này
4. Click **`Deploy`**
5. Sẽ hiện popup yêu cầu quyền → click **`Authorize access`** → đăng nhập → **`Allow`**
6. Sau khi deploy xong, copy **`Web app URL`** (dạng: `https://script.google.com/macros/s/AKfyc.../exec`)

---

## ⚙️ BƯỚC 2: CẤU HÌNH FRONTEND

1. Mở file **`public/config.js`**
2. Thay URL trong dòng `APPS_SCRIPT_URL` bằng URL vừa copy:

```javascript
const CONFIG = {
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfyc.../exec',
  SHOW_PUBLIC_LIST: true
};
```

3. Lưu file lại

---

## ⚙️ BƯỚC 3: DEPLOY LÊN VERCEL

### Cách 1: Deploy qua giao diện web (dễ nhất)

1. Tạo tài khoản Vercel: https://vercel.com/signup (đăng nhập bằng GitHub khuyến nghị)
2. Tạo repo GitHub mới, upload toàn bộ thư mục project lên
3. Vào https://vercel.com/new → **`Import`** repo vừa tạo
4. Framework Preset: **`Other`**
5. Root Directory: để mặc định
6. Click **`Deploy`**
7. Đợi ~30 giây là xong, sẽ có URL dạng: `https://rising-star-tournament.vercel.app`

### Cách 2: Deploy qua Vercel CLI (nhanh, không cần GitHub)

```bash
# Cài Vercel CLI (chỉ làm 1 lần)
npm install -g vercel

# Đi vào thư mục project
cd rising-star-tournament

# Deploy
vercel

# Lần đầu sẽ hỏi vài câu, cứ Enter để dùng mặc định
# Khi xong sẽ có URL public

# Deploy production
vercel --prod
```

---

## ✅ BƯỚC 4: KIỂM TRA

1. Mở URL Vercel vừa deploy
2. Thử ghi danh 1 người chơi → kiểm tra Google Sheet xem có dữ liệu chưa
3. Click tab "Bảng phong thần" để xem danh sách

---

## 🔧 KHẮC PHỤC SỰ CỐ

### ❌ "Không kết nối được server"
- Kiểm tra URL trong `config.js` có đúng không
- Đảm bảo Apps Script đã chọn **`Who has access: Anyone`**
- Mở URL Apps Script trực tiếp trên browser xem có ra JSON không

### ❌ "Có lỗi xảy ra" khi submit
- Mở Console (F12) xem lỗi cụ thể
- Vào Apps Script → menu `Execution log` xem có lỗi gì

### ❌ Sheet không lưu được dữ liệu
- Đảm bảo tab Sheet tên là **`DangKy`** (không dấu)
- Apps Script phải được mở từ chính Sheet đó (không phải tạo riêng)

### ❌ Update code Apps Script không có hiệu lực
- Phải **Deploy lại version mới**: `Deploy` → `Manage deployments` → icon bút chì → đổi version thành "New version" → Deploy
- **URL không đổi**, không cần update lại frontend

---

## 📊 XEM & XUẤT DỮ LIỆU

- Vào Google Sheet vừa tạo để xem tất cả đăng ký
- Có thể xuất Excel: `File` → `Download` → `Microsoft Excel (.xlsx)`
- Hoặc xuất CSV để xử lý: `File` → `Download` → `Comma-separated values`

---

## 💡 TIPS

1. **Đóng đăng ký**: Vào Apps Script, comment dòng `sheet.appendRow(...)` trong hàm `registerPlayer` để chặn ghi mới
2. **Đổi giao diện**: Sửa file `public/styles.css`, deploy lại
3. **Backup dữ liệu**: Định kỳ tải Google Sheet về máy
4. **Domain riêng**: Trong Vercel dashboard → Settings → Domains, có thể thêm domain riêng (ví dụ `dangky.bangnhatmong.com`)

---

## 📁 CẤU TRÚC PROJECT

```
rising-star-tournament/
├── public/
│   ├── index.html       # Trang chính
│   ├── styles.css       # CSS phong cách cổ trang
│   ├── app.js           # Logic JS (submit, load list)
│   └── config.js        # ⚠️ Cấu hình URL Apps Script
├── google-apps-script.js # Code backend (paste vào Apps Script)
├── vercel.json          # Cấu hình Vercel
├── package.json
└── HUONG_DAN_DEPLOY.md  # File này
```

---

Chúc giải đấu thành công! 🏆
