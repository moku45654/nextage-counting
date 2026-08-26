function runFetchAndWrite() {
  const tags = [
    "ボカコレ2026夏TOP100ランキング参加曲",
    "ボカコレ2026夏ルーキー参加曲",
    "ボカコレ2026夏REMIX参加曲",
    "ボカコレ2026夏ex",
    "本ネク新世界",
  ];
  const videos = getVideosByTags(tags);
  const fields = [
    "contentId",
    "title",
    "userId",
    "viewCounter",
    "likeCounter",
    "commentCounter",
    "mylistCounter",
    "lengthSeconds",
    "startTime",
    "tags",
  ];
  const data2D = convertObjectsTo2DArray(videos, fields);
  writeToSheet(getLogicalDate(), data2D);
}

function runAggregateAndWrite() {
  const d1 = "2026/09/18";
  const d2 = "2026/10/01";
  const vocTags = [
    "ボカコレ2026夏TOP100ランキング参加曲",
    "ボカコレ2026夏ルーキー参加曲",
    "ボカコレ2026夏ex",
  ];
  const honTag = "本ネク新世界";
  const topN = 30; // 上位N曲を取得する
  const excludeTags = ["ボカコレ2026夏REMIX参加曲"]; // 除外するタグを指定
  const startTimeFrom = "2026-09-18T17:00:00+09:00"; // 期間の開始日
  const startTimeTo = "2026-09-20T00:00:00+09:00"; // 期間の終了日
  const data2D = aggregate(
    vocTags,
    honTag,
    d1,
    d2,
    "集計結果",
    topN,
    excludeTags,
    startTimeFrom,
    startTimeTo,
  );
  writeToSheet("集計結果", data2D);
}
