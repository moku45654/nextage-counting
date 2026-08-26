function aggregate(vocTags, honTag, d1, d2, sheetName, topN = 30) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet1 = ss.getSheetByName(d1);
  const sheet2 = ss.getSheetByName(d2);

  if (!sheet1 || !sheet2) return;

  const excludeSheet = ss.getSheetByName("exclude");
  const excludeSet = new Set();
  if (excludeSheet) {
    const excludeData = excludeSheet.getDataRange().getValues();
    // データのある1行目から開始して、空白でないIDをセットに追加
    for (let i = 1; i < excludeData.length; i++) {
      const id = String(excludeData[i][0]).trim();
      if (id) excludeSet.add(id);
    }
  }

  // d1とd2時点のデータを取得
  const data1 = sheet1.getDataRange().getValues();
  const data2 = sheet2.getDataRange().getValues();

  // ヘッダーのインデックスを取得する関数
  const getIndices = (headers) => ({
    id: headers.indexOf("contentId"),
    title: headers.indexOf("title"),
    tags: headers.indexOf("tags"),
    view: headers.indexOf("viewCounter"),
    like: headers.indexOf("likeCounter"),
    comment: headers.indexOf("commentCounter"),
    mylist: headers.indexOf("mylistCounter"),
  });

  const idx1 = getIndices(data1[0]);
  const idx2 = getIndices(data2[0]);

  // 動画IDをキーにして、d1とd2のデータをマップに格納
  const map1 = new Map();
  for (let i = 1; i < data1.length; i++) {
    const row = data1[i];
    const id = row[idx1.id];
    if (excludeSet.has(id)) continue;
    map1.set(id, {
      title: row[idx1.title],
      tags: String(row[idx1.tags]),
      view: Number(row[idx1.view]) || 0,
      like: Number(row[idx1.like]) || 0,
      comment: Number(row[idx1.comment]) || 0,
      mylist: Number(row[idx1.mylist]) || 0,
    });
  }

  const map2 = new Map();
  for (let i = 1; i < data2.length; i++) {
    const row = data2[i];
    const id = row[idx2.id];
    if (excludeSet.has(id)) continue;
    map2.set(id, {
      title: row[idx2.title],
      tags: String(row[idx2.tags]),
      view: Number(row[idx2.view]) || 0,
      like: Number(row[idx2.like]) || 0,
      comment: Number(row[idx2.comment]) || 0,
      mylist: Number(row[idx2.mylist]) || 0,
    });
  }

  // ボカコレのタグがあるか、本ネクのタグがあるかを判定する関数
  const hasVoc = (tags) => vocTags.some((t) => tags.includes(t));
  const hasHon = (tags) =>
    Array.isArray(honTag)
      ? honTag.some((t) => tags.includes(t))
      : tags.includes(honTag);

  // X: ボカコレ＆本ネク一覧、Y: 本ネクのみ一覧
  const listX = [];
  const listY = [];

  map1.forEach((val1, id) => {
    // ボカコレのタグがあり、本ネクのタグもある場合はXリストに追加
    if (hasVoc(val1.tags) && hasHon(val1.tags)) {
      const val2 = map2.get(id) || {
        title: val1.title,
        tags: val1.tags,
        view: 0,
        like: 0,
        comment: 0,
        mylist: 0,
      };
      listX.push({
        id,
        title: val2.title || val1.title,
        tags: val2.tags || val1.tags,
        type: "X",
        d1: val1,
        d2: val2,
        diff: {
          view: val2.view - val1.view,
          like: val2.like - val1.like,
          comment: val2.comment - val1.comment,
          mylist: val2.mylist - val1.mylist,
        },
      });
    }
  });

  map2.forEach((val2, id) => {
    // 本ネクのタグがあり、ボカコレのタグがない場合はYリストに追加
    if (hasHon(val2.tags) && !hasVoc(val2.tags)) {
      const val1 = map1.get(id) || { view: 0, like: 0, comment: 0, mylist: 0 };
      listY.push({
        id,
        title: val2.title,
        tags: val2.tags,
        type: "Y",
        d1: val1,
        d2: val2,
        diff: {
          view: val2.view - val1.view,
          like: val2.like - val1.like,
          comment: val2.comment - val1.comment,
          mylist: val2.mylist - val1.mylist,
        },
      });
    }
  });

  const combined = [...listX, ...listY];
  combined.sort((a, b) => {
    if (b.diff.mylist !== a.diff.mylist) return b.diff.mylist - a.diff.mylist;
    if (b.diff.like !== a.diff.like) return b.diff.like - a.diff.like;
    return b.diff.comment - a.diff.comment;
  });
  var topN = Math.min(topN, combined.length);
  const topList = combined.slice(0, topN);

  const formatRows = (list) =>
    list.map((item) => [
      item.id,
      item.title,
      item.tags,
      item.type,
      item.d1.view,
      item.d1.like,
      item.d1.comment,
      item.d1.mylist,
      item.d2.view,
      item.d2.like,
      item.d2.comment,
      item.d2.mylist,
      item.diff.view,
      item.diff.like,
      item.diff.comment,
      item.diff.mylist,
    ]);

  const headers = [
    "contentId",
    "title",
    "tags",
    "区分",
    `再生_${d1}`,
    `いいね_${d1}`,
    `コメ_${d1}`,
    `マイリス_${d1}`,
    `再生_${d2}`,
    `いいね_${d2}`,
    `コメ_${d2}`,
    `マイリス_${d2}`,
    "差分_再生",
    "差分_いいね",
    "差分_コメ",
    "差分_マイリス",
  ];

  const outputData = [
    [`上位${topN}曲（マイリス差分順）`],
    headers,
    ...formatRows(topList),
    [],
    ["X: ボカコレ＆本ネク一覧"],
    headers,
    ...formatRows(listX),
    [],
    ["Y: 本ネクのみ一覧"],
    headers,
    ...formatRows(listY),
  ];

  writeToSheet(sheetName, outputData);
}
