function runFetchAndWrite() {
  const tags = [
    "ボカコレ2026夏TOP100ランキング参加曲",
    "ボカコレ2026夏ルーキー参加曲",
    "ボカコレ2026夏REMIX参加曲",
    "ボカコレ2026夏ex",
  ];
  const videos = getVideosByTags(tags);
  const data2D = convertObjectsTo2DArray(videos);
  writeToSheet(getLogicalDate(), data2D);
}

function runCompareAndWrite() {
  const d1 = "2026/09/18";
  const d2 = "2026/09/31";
  const tagA = "本ネク新世界";
  const data2D = compareMylistCount(d1, d2, tagA);
  writeToSheet("比較結果", data2D);
}
