// =============================================================
// GOOGLE APPS SCRIPT - BACKEND CHO FORM ĐĂNG KÝ GIẢI ĐẤU
// Bản cập nhật: thêm chức năng khóa/mở khóa đăng ký bằng admin code
// =============================================================
// Hướng dẫn cập nhật:
// 1. Mở Google Sheet hiện có
// 2. Vào Extensions → Apps Script
// 3. Xóa code cũ, paste toàn bộ file này vào
// 4. ĐỔI giá trị ADMIN_CODE bên dưới thành code admin của bạn
// 5. Click Save (Ctrl+S)
// 6. Click "Deploy" → "Manage deployments" → icon bút chì
// 7. Chọn Version: "New version" → Deploy
// 8. URL KHÔNG ĐỔI - frontend không cần update
// =============================================================

// ⚠️ ĐỔI CODE NÀY THÀNH CODE ADMIN CỦA BẠN (chỉ admin mới biết)
const ADMIN_CODE = 'bunbo2026';

const SHEET_NAME = 'DangKy';
const SHEET_RESULTS = 'KetQuaRandom';
const SHEET_STATE = 'TrangThai'; // sheet lưu trạng thái khóa

function doGet(e) {
  try {
    const action = e.parameter.action;

    if (action === 'list') {
      return jsonResponse({
        success: true,
        items: getAllRegistrations(),
        locked: isRegistrationLocked()
      });
    }

    if (action === 'list_results') {
      return jsonResponse({ success: true, sessions: getAllResults() });
    }

    if (action === 'get_state') {
      return jsonResponse({ success: true, locked: isRegistrationLocked() });
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
      // Chặn đăng ký nếu đã khóa
      if (isRegistrationLocked()) {
        return jsonResponse({ success: false, error: 'Đã kết thúc thời gian ghi danh' });
      }
      const result = registerPlayer({
        name: e.parameter.name,
        id: e.parameter.id,
        he: e.parameter.he,
        discord: e.parameter.discord
      });
      return jsonResponse(result);
    }

    if (action === 'save_teams') {
      const result = saveTeamsResult({
        teams: e.parameter.teams,
        bench: e.parameter.bench
      });
      return jsonResponse(result);
    }

    if (action === 'lock_registration') {
      if (e.parameter.code !== ADMIN_CODE) {
        return jsonResponse({ success: false, error: 'Code admin không đúng' });
      }
      setRegistrationLocked(true);
      return jsonResponse({ success: true, locked: true });
    }

    if (action === 'unlock_registration') {
      if (e.parameter.code !== ADMIN_CODE) {
        return jsonResponse({ success: false, error: 'Code admin không đúng' });
      }
      setRegistrationLocked(false);
      return jsonResponse({ success: true, locked: false });
    }

    return jsonResponse({ success: false, error: 'Action không hợp lệ' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

// ====== TRẠNG THÁI KHÓA ======
function getStateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_STATE);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_STATE);
    sheet.getRange('A1').setValue('key');
    sheet.getRange('B1').setValue('value');
    sheet.getRange('A2').setValue('registration_locked');
    sheet.getRange('B2').setValue('false');
    sheet.getRange(1, 1, 1, 2).setFontWeight('bold').setBackground('#2c1810').setFontColor('#f4d03f');
  }
  return sheet;
}

function isRegistrationLocked() {
  const sheet = getStateSheet();
  // Tìm dòng có key = registration_locked
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;
  const values = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  for (let i = 0; i < values.length; i++) {
    if (values[i][0] === 'registration_locked') {
      return String(values[i][1]).toLowerCase() === 'true';
    }
  }
  return false;
}

function setRegistrationLocked(locked) {
  const sheet = getStateSheet();
  const lastRow = sheet.getLastRow();
  const value = locked ? 'true' : 'false';

  // Tìm dòng có key = registration_locked
  if (lastRow >= 2) {
    const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < values.length; i++) {
      if (values[i][0] === 'registration_locked') {
        sheet.getRange(i + 2, 2).setValue(value);
        return;
      }
    }
  }
  // Chưa có thì thêm mới
  sheet.appendRow(['registration_locked', value]);
}

// ====== ĐĂNG KÝ ======
function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Thời gian', 'Tên người chơi', 'ID người chơi', 'Hệ phái', 'ID Discord']);
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#2c1810').setFontColor('#f4d03f');
  }
  return sheet;
}

function registerPlayer(data) {
  if (!data.name || !data.id || !data.he || !data.discord) {
    return { success: false, error: 'Thiếu thông tin' };
  }

  const validHe = ['Tố vấn', 'Thiết y', 'Cửu linh', 'Long ngâm', 'Thần tương', 'Toái mộng', 'Huyết Hà'];
  if (validHe.indexOf(data.he) === -1) {
    return { success: false, error: 'Hệ phái không hợp lệ' };
  }

  const sheet = getSheet();
  const lastRow = sheet.getLastRow();

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

// ====== KẾT QUẢ RANDOM TEAMS ======
function getResultsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_RESULTS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_RESULTS);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Thời gian Random', 'Lượt #', 'Tên Đội', 'Vị trí', 'Tên người chơi', 'ID người chơi', 'Hệ phái', 'ID Discord']);
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#2c1810').setFontColor('#f4d03f');
    sheet.setColumnWidths(1, 8, 130);
  }
  return sheet;
}

function saveTeamsResult(data) {
  if (!data.teams) {
    return { success: false, error: 'Thiếu dữ liệu teams' };
  }

  let teams, bench;
  try {
    teams = JSON.parse(data.teams);
    bench = data.bench ? JSON.parse(data.bench) : [];
  } catch (e) {
    return { success: false, error: 'Dữ liệu không hợp lệ' };
  }

  const sheet = getResultsSheet();
  const ts = new Date();

  const lastRow = sheet.getLastRow();
  let sessionNum = 1;
  if (lastRow > 1) {
    const sessionCol = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
    const sessionNumbers = sessionCol.map(r => Number(r[0]) || 0);
    sessionNum = Math.max(...sessionNumbers) + 1;
  }

  const rowsToAdd = [];

  teams.forEach((team, teamIdx) => {
    team.members.forEach((member, memberIdx) => {
      rowsToAdd.push([
        ts,
        sessionNum,
        team.name || `Đội ${teamIdx + 1}`,
        `Thành viên ${memberIdx + 1}`,
        member.name || '',
        member.id || '',
        member.he || '',
        member.discord || ''
      ]);
    });
  });

  if (bench && bench.length > 0) {
    bench.forEach((member, idx) => {
      rowsToAdd.push([
        ts,
        sessionNum,
        '⚠ DỰ BỊ',
        `Dự bị ${idx + 1}`,
        member.name || '',
        member.id || '',
        member.he || '',
        member.discord || ''
      ]);
    });
  }

  if (rowsToAdd.length > 0) {
    const startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, rowsToAdd.length, 8).setValues(rowsToAdd);

    if (sessionNum % 2 === 0) {
      sheet.getRange(startRow, 1, rowsToAdd.length, 8).setBackground('#fdf6e3');
    }
  }

  return {
    success: true,
    sessionNum: sessionNum,
    teamsCount: teams.length,
    benchCount: bench ? bench.length : 0
  };
}

function getAllResults() {
  const sheet = getResultsSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, 8).getValues();

  const sessions = {};
  values.forEach(row => {
    const sessionNum = row[1];
    if (!sessions[sessionNum]) {
      sessions[sessionNum] = {
        sessionNum: sessionNum,
        ts: row[0],
        teams: {},
        bench: []
      };
    }
    const teamName = row[2];
    if (teamName === '⚠ DỰ BỊ') {
      sessions[sessionNum].bench.push({
        name: row[4], id: row[5], he: row[6], discord: row[7]
      });
    } else {
      if (!sessions[sessionNum].teams[teamName]) {
        sessions[sessionNum].teams[teamName] = [];
      }
      sessions[sessionNum].teams[teamName].push({
        name: row[4], id: row[5], he: row[6], discord: row[7]
      });
    }
  });

  return Object.values(sessions).map(s => ({
    sessionNum: s.sessionNum,
    ts: s.ts,
    teams: Object.entries(s.teams).map(([name, members]) => ({ name, members })),
    bench: s.bench
  }));
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
