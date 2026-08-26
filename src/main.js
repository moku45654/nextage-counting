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
  const d1 = "2026/08/22";
  const d2 = "2026/08/23";
  const vocTags = [
    "ボカコレ2026夏TOP100ランキング参加曲",
    "ボカコレ2026夏ルーキー参加曲",
    "ボカコレ2026夏REMIX参加曲",
    "ボカコレ2026夏ex",
  ];
  const honTag = "本ネク新世界";
  const topN = 30; // 上位N曲を取得する
  const data2D = aggregate(vocTags, honTag, d1, d2, "集計結果", topN);
  writeToSheet("集計結果", data2D);
}
