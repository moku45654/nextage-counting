// 午前5時を基準に日付を取得する関数
function getLogicalDate() {
  const date = new Date();
  date.setHours(date.getHours() - 5);
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy/MM/dd");
}

// データをスプレッドシートに書き込む関数
function writeToSheet(sheetName, data2D) {
  if (!data2D || data2D.length === 0) return;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);

  if (sheet) {
    sheet.clear();
  } else {
    sheet = ss.insertSheet(sheetName);
  }

  sheet.getRange(1, 1, data2D.length, data2D[0].length).setValues(data2D);
}

function clearSheetsByDates(dates) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  dates.forEach((date) => {
    const sheet = ss.getSheetByName(date);
    if (sheet) sheet.clear();
  });
}
