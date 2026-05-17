// =============================================================
// GOOGLE APPS SCRIPT - BACKEND CHO FORM ĐĂNG KÝ GIẢI ĐẤU
// =============================================================
// Hướng dẫn:
// 1. Mở https://sheets.google.com tạo Google Sheet mới, đặt tên "Rising Star - Đăng ký"
// 2. Tạo sheet đầu tiên tên là "DangKy" (không dấu)
// 3. Trên Sheet, vào Extensions → Apps Script
// 4. Xóa code mặc định, paste toàn bộ file này vào
// 5. Click "Deploy" → "New deployment"
// 6. Chọn Type = "Web app"
// 7. Execute as: Me · Who has access: Anyone
// 8. Click Deploy, copy URL trả về
// 9. Paste URL vào file config.js trong frontend
// =============================================================

const SHEET_NAME = 'DangKy';

function doGet(e) {
  try {
    const action = e.parameter.action;

    if (action === 'list') {
      return jsonResponse({ success: true, items: getAllRegistrations() });
    }

    return jsonResponse({ success: true, message: 'API hoạt động bình thường' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function doPost(e) {
  try {
    const action = e.parameter.action;

    if (action === 'register') {
      const result = registerPlayer({
        name: e.parameter.name,
        id: e.parameter.id,
        he: e.parameter.he,
        discord: e.parameter.discord
      });
      return jsonResponse(result);
    }

    return jsonResponse({ success: false, error: 'Action không hợp lệ' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  // Đảm bảo có header
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Thời gian', 'Tên người chơi', 'ID người chơi', 'Hệ phái', 'ID Discord']);
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#2c1810').setFontColor('#f4d03f');
  }
  return sheet;
}

function registerPlayer(data) {
  // Validate
  if (!data.name || !data.id || !data.he || !data.discord) {
    return { success: false, error: 'Thiếu thông tin' };
  }

  const validHe = ['Tố vấn', 'Thiết y', 'Cửu linh', 'Long ngâm', 'Thần tương', 'Toái mộng'];
  if (validHe.indexOf(data.he) === -1) {
    return { success: false, error: 'Hệ phái không hợp lệ' };
  }

  const sheet = getSheet();
  const lastRow = sheet.getLastRow();

  // Check duplicate ID người chơi và Discord
  if (lastRow > 1) {
    const values = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
    for (let i = 0; i < values.length; i++) {
      if (String(values[i][2]).toLowerCase() === data.id.toLowerCase()) {
        return { success: false, error: 'ID người chơi này đã ghi danh rồi' };
      }
      if (String(values[i][4]).toLowerCase() === data.discord.toLowerCase()) {
        return { success: false, error: 'ID Discord này đã ghi danh rồi' };
      }
    }
  }

  // Append
  const ts = new Date();
  sheet.appendRow([ts, data.name, data.id, data.he, data.discord]);

  return { success: true };
}

function getAllRegistrations() {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
  return values.map(row => ({
    ts: row[0],
    name: row[1],
    id: row[2],
    he: row[3],
    discord: row[4]
  }));
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
