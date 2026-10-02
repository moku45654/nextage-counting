type SheetCell = string | number | boolean | Date | null | undefined;
type SheetRecord = Record<string, SheetCell>;

/** オブジェクト配列を指定した列順の二次元配列へ変換する。 */
function convertObjectsTo2DArray<T extends Record<string, SheetCell>>(
  objects: T[] | null | undefined,
  fields?: Array<keyof T & string>,
): SheetCell[][] {
  if (!objects || objects.length === 0) return [];
  const headers =
    fields ?? (Object.keys(objects[0]) as Array<keyof T & string>);
  const data2D: SheetCell[][] = [[...headers]];
  objects.forEach((obj) => {
    data2D.push(headers.map((key) => obj[key]));
  });
  return data2D;
}

/**
 * シートのヘッダー行をキーにして、各データ行をオブジェクトへ変換する。
 * @param sheetName 読み込むシート名
 * @returns シートの各行を表すレコード配列。シートがない場合は空配列
 */
function getSheetAsObjects(sheetName: string): SheetRecord[] {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length === 0) return [];

  const [headers, ...rows] = data;

  return rows.map((row) => {
    const record: SheetRecord = {};
    headers.forEach((header, index) => {
      const key = String(header ?? "");
      if (key) record[key] = row[index] as SheetCell;
    });
    return record;
  });
}
