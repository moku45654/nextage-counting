function getTargetContentIds(
  candidateSheetName,
  vocTags,
  honTag,
  excludeTags = [],
  startTimeFrom = null,
  startTimeTo = null,
) {
  // 投稿期間終了直後のシートから、ボカコレ参加曲の本ネク参加曲を抽出する
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const candidateSheet = ss.getSheetByName(candidateSheetName);
  if (!candidateSheet) return [];

  const data = candidateSheet.getDataRange().getValues();
  if (data.length < 2) return [];

  const headers = data[0];
  const idIdx = headers.indexOf("contentId");
  const tagsIdx = headers.indexOf("tags");
  const startTimeIdx = headers.indexOf("startTime");
  if (idIdx === -1 || tagsIdx === -1) return [];

  // 除外リストのcontentIdをセットに格納
  const excludeSheet = ss.getSheetByName("exclude");
  const excludeSet = new Set();
  if (excludeSheet) {
    const excludeData = excludeSheet.getDataRange().getValues();
    if (excludeData.length > 1) {
      const idColIdx = excludeData[0].indexOf("contentId");
      if (idColIdx !== -1) {
        for (let i = 1; i < excludeData.length; i++) {
          const id = String(excludeData[i][idColIdx]).trim();
          if (id) excludeSet.add(id);
        }
      }
    }
  }

  const hasExcludeTag = (tags) => excludeTags.some((tag) => tags.includes(tag));
  const hasVoc = (tags) => vocTags.some((tag) => tags.includes(tag));
  const hasHon = (tags) =>
    Array.isArray(honTag)
      ? honTag.some((tag) => tags.includes(tag))
      : tags.includes(honTag);
  const isWithinPeriod = (startTimeStr) => {
    if (!startTimeFrom && !startTimeTo) return true;
    if (!startTimeStr) return false;
    const time = new Date(startTimeStr).getTime();
    if (startTimeFrom && time < new Date(startTimeFrom).getTime()) return false;
    if (startTimeTo && time >= new Date(startTimeTo).getTime()) return false;
    return true;
  };

  // 条件に合致するcontentIdを抽出
  const contentIds = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const id = String(row[idIdx] ?? "").trim();
    const tags = String(row[tagsIdx]);
    const startTime = startTimeIdx !== -1 ? row[startTimeIdx] : null;

    // もし以下のいずれかの場合はスキップ。
    // 1. 除外リストのシートに含まれる
    // 2. 除外タグが含まれる
    // 3. 本ネク参加曲でない
    // 4. 新規投稿曲（ボカコレ参加曲でない）でかつ投稿期間外
    if (
      !id ||
      excludeSet.has(id) ||
      hasExcludeTag(tags) ||
      !hasHon(tags) ||
      (!hasVoc(tags) && !isWithinPeriod(startTime))
    ) {
      continue;
    }
    contentIds.push(id);
  }
  return contentIds;
}

function aggregate(contentIds, vocTags, d1, d2, sheetName, topN = 30) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet1 = ss.getSheetByName(d1);
  const sheet2 = ss.getSheetByName(d2);

  if (!sheet1 || !sheet2) return;

  const data1 = sheet1.getDataRange().getValues();
  const data2 = sheet2.getDataRange().getValues();

  const getIndices = (headers) => ({
    id: headers.indexOf("contentId"),
    title: headers.indexOf("title"),
    tags: headers.indexOf("tags"),
    startTime: headers.indexOf("startTime"),
    view: headers.indexOf("viewCounter"),
    like: headers.indexOf("likeCounter"),
    comment: headers.indexOf("commentCounter"),
    mylist: headers.indexOf("mylistCounter"),
  });

  const idx1 = getIndices(data1[0]);
  const idx2 = getIndices(data2[0]);

  const toMap = (data, indices) => {
    const map = new Map();
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const id = String(row[indices.id] ?? "").trim();
      if (!id) continue;
      map.set(id, {
        title: row[indices.title],
        tags: String(row[indices.tags]),
        startTime: indices.startTime !== -1 ? row[indices.startTime] : null,
        view: Number(row[indices.view]) || 0,
        like: Number(row[indices.like]) || 0,
        comment: Number(row[indices.comment]) || 0,
        mylist: Number(row[indices.mylist]) || 0,
      });
    }
    return map;
  };
  const map1 = toMap(data1, idx1);
  const map2 = toMap(data2, idx2);
  const hasVoc = (tags) => vocTags.some((tag) => tags.includes(tag));

  const emptyStats = {
    title: "",
    tags: "",
    startTime: null,
    view: 0,
    like: 0,
    comment: 0,
    mylist: 0,
  };
  const combined = contentIds.map((id) => {
    const val1 = map1.get(id) || emptyStats;
    const val2 = map2.get(id) || emptyStats;
    return {
      id,
      title: val2.title || val1.title,
      tags: val2.tags || val1.tags,
      startTime: val2.startTime || val1.startTime,
      type: hasVoc(val1.tags) || hasVoc(val2.tags) ? "X" : "Y",
      d1: val1,
      d2: val2,
      diff: {
        view: val2.view - val1.view,
        like: val2.like - val1.like,
        comment: val2.comment - val1.comment,
        mylist: val2.mylist - val1.mylist,
      },
    };
  });

  const listX = combined.filter((item) => item.type === "X");
  const listY = combined.filter((item) => item.type === "Y");
  combined.sort((a, b) => {
    if (b.diff.mylist !== a.diff.mylist) return b.diff.mylist - a.diff.mylist;
    if (b.diff.like !== a.diff.like) return b.diff.like - a.diff.like;
    return b.diff.comment - a.diff.comment;
  });
  const displayCount = Math.min(topN, combined.length);
  const topList = combined.slice(0, displayCount);

  const formatRows = (list) =>
    list.map((item) => [
      item.id,
      item.title,
      item.tags,
      item.startTime,
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
    "startTime",
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
    [`上位${displayCount}曲（マイリス差分順）`],
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
