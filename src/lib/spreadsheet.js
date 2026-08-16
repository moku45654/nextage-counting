// 午前5時を基準に日付を取得する関数
function getLogicalDate() {
  const date = new Date();
  date.setHours(date.getHours() - 5);
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy/MM/dd");
}

// 取得した動画データをスプレッドシートに書き込む関数
function writeVideosToSheet(allVideos) {
  if (!allVideos || allVideos.length === 0) return;

  const sheetName = getLogicalDate();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);

  if (sheet) {
    sheet.clear();
  } else {
    sheet = ss.insertSheet(sheetName);
  }

  // 最初のデータのキーをヘッダーとして利用する
  const headers = Object.keys(allVideos[0]);
  // データを2次元配列に変換
  const rows = allVideos.map((video) => headers.map((key) => video[key]));

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
}

function clearSheetsByDates(dates) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  dates.forEach((date) => {
    const sheet = ss.getSheetByName(date);
    if (sheet) sheet.clear();
  });
}
