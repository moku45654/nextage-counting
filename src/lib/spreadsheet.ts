/** 午前5時を基準にした論理日付を yyyy/MM/dd 形式で返す。 */
function getLogicalDate(): string {
  const date = new Date();
  date.setHours(date.getHours() - 5);
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy/MM/dd");
}

/** 二次元配列を指定したシートへ書き込む。 */
function writeToSheet(sheetName: string, data2D: SheetCell[][]): void {
  if (data2D.length === 0) return;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (sheet) {
    sheet.clear();
  } else {
    sheet = ss.insertSheet(sheetName);
  }

  const columnCount = Math.max(...data2D.map((row) => row.length));
  const normalizedData = data2D.map((row) =>
    row.concat(Array<SheetCell>(columnCount - row.length).fill("")),
  );

  sheet
    .getRange(1, 1, normalizedData.length, columnCount)
    .setValues(normalizedData);
}

/** 指定した日付シートを存在する場合にクリアする。 */
function clearSheetsByDates(dates: string[]): void {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  dates.forEach((date) => {
    const sheet = ss.getSheetByName(date);
    if (sheet) sheet.clear();
  });
}
