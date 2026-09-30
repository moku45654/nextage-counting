function testAggregateAndWrite() {
  const candidateSheetName = "2026/08/23";
  const d1 = "2026/08/22";
  const d2 = "2026/08/23";
  const vocTags = [
    "ボカコレ2026夏TOP100ランキング参加曲",
    "ボカコレ2026夏ルーキー参加曲",
    "ボカコレ2026夏ex",
  ];
  const honTag = "VOCAROCK";
  const topN = 50; // 上位N曲を取得する
  const excludeTags = ["ボカコレ2026夏REMIX参加曲"]; // 除外するタグを指定
  const startTimeFrom = "2026-09-18T17:00:00+09:00"; // 期間の開始日
  const startTimeTo = "2026-09-20T00:00:00+09:00"; // 期間の終了（この時刻は含まない）
  const contentIds = getTargetContentIds(
    candidateSheetName,
    vocTags,
    honTag,
    excludeTags,
    startTimeFrom,
    startTimeTo,
  );
  aggregate(contentIds, vocTags, d1, d2, "集計結果", topN);
}
