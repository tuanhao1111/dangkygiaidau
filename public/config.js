// === CẤU HÌNH ===
// Thay URL này bằng Web App URL của Google Apps Script sau khi deploy
const CONFIG = {
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzfLP8fcaBC5eavXY0GCglmPXyOr2_kPwsT1urL75XXzPyRRLWu3gmR93Pvzp5aG-M/exec',

  // Có cho phép mọi người xem danh sách công khai không? (true/false)
  SHOW_PUBLIC_LIST: true,

  // ===== KHÓA CHỨC NĂNG GIẢ LẬP LẬP ĐỘI =====
  // Đặt true để bật chức năng khóa theo giờ. Đặt false để mở khóa ngay lập tức.
  SIMULATOR_LOCKED: true,

  // Thời điểm mở khóa chức năng giả lập (giờ Việt Nam UTC+7)
  // Format: YYYY-MM-DDTHH:MM:SS+07:00
  // Mặc định: 21:00 (9h tối) thứ 7 ngày 23/05/2026
  SIMULATOR_UNLOCK_TIME: '2026-05-23T21:00:00+07:00'
};

