function compareMylistCount(d1, d2, tag) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet1 = ss.getSheetByName(d1);
  const sheet2 = ss.getSheetByName(d2);

  if (!sheet1 || !sheet2) return [];

  const data1 = sheet1.getDataRange().getValues();
  const data2 = sheet2.getDataRange().getValues();

  const headers1 = data1[0];
  const headers2 = data2[0];

  const idIdx1 = headers1.indexOf("contentId");
  const mylistIdx1 = headers1.indexOf("mylistCounter");
  const idIdx2 = headers2.indexOf("contentId");
  const tagsIdx2 = headers2.indexOf("tags");
  const mylistIdx2 = headers2.indexOf("mylistCounter");
  const titleIdx2 = headers2.indexOf("title");

  if (
    idIdx1 === -1 ||
    mylistIdx1 === -1 ||
    idIdx2 === -1 ||
    tagsIdx2 === -1 ||
    mylistIdx2 === -1
  )
    return [];

  const map1 = new Map();
  for (let i = 1; i < data1.length; i++) {
    map1.set(data1[i][idIdx1], Number(data1[i][mylistIdx1]) || 0);
  }

  const result = [
    ["contentId", "title", "tags", `mylist_${d1}`, `mylist_${d2}`, "diff"],
  ];

  for (let i = 1; i < data2.length; i++) {
    const row = data2[i];
    const tags = String(row[tagsIdx2]);

    if (tags.includes(tag)) {
      const id = row[idIdx2];
      const mylist2 = Number(row[mylistIdx2]) || 0;
      const mylist1 = map1.has(id) ? map1.get(id) : 0;
      const diff = mylist2 - mylist1;

      result.push([id, row[titleIdx2], tags, mylist1, mylist2, diff]);
    }
  }

  return result;
}
