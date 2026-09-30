// ================================================
//  HƯỚNG DẪN CÀI ĐẶT GOOGLE APPS SCRIPT
// ================================================
//
//  1. Mở Google Sheet mới tại: https://sheets.google.com
//  2. Tạo sheet tên "wishes" (tab ở dưới)
//     - Hàng 1 đặt header: | Thời gian | Tên | Lời chúc |
//  3. Trong Google Sheet: menu Extensions → Apps Script
//  4. Xoá toàn bộ code mặc định, dán code bên dưới vào
//  5. Lưu (Ctrl+S)
//  6. Nhấn Deploy → New deployment
//     - Type: Web app
//     - Execute as: Me
//     - Who has access: Anyone
//  7. Nhấn Deploy → Copy URL vừa tạo
//  8. Dán URL đó vào information.js tại trường sheetApiUrl
//
// ================================================
//  CODE DÁN VÀO APPS SCRIPT (từ dòng dưới)
// ================================================

const SHEET_NAME = 'wishes';

function doGet(e) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME)
             || ss.insertSheet(SHEET_NAME);

  let data;

  if (e.parameter.action === 'add') {
    const name = e.parameter.name || '';
    const wish = e.parameter.wish || '';
    if (name) {
      sheet.appendRow([
        new Date().toLocaleString('vi-VN'),
        name,
        wish
      ]);
    }
    data = { ok: true };
  } else {
    const rows = sheet.getDataRange().getValues();
    data = rows.slice(1)
      .reverse()
      .map(r => ({ name: r[1], wish: r[2] }))
      .filter(w => w.name);
  }

  const json = JSON.stringify(data);
  const callback = e.parameter.callback;

  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}
