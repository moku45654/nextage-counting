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

  // 各行で列数が異なっていても正しく書き込めるよう、最大の列数に合わせて空白を埋める
  const columnCount = Math.max(...data2D.map((row) => row.length));
  const normalizedData = data2D.map((row) =>
    row.concat(Array(columnCount - row.length).fill("")),
  );

  sheet
    .getRange(1, 1, normalizedData.length, columnCount)
    .setValues(normalizedData);
}

function clearSheetsByDates(dates) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  dates.forEach((date) => {
    const sheet = ss.getSheetByName(date);
    if (sheet) sheet.clear();
  });
}
