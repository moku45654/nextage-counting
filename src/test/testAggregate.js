function testAggregateAndWrite() {
  const d1 = "2026/08/22";
  const d2 = "2026/08/23";
  const vocTags = [
    "ボカコレ2026夏TOP100ランキング参加曲",
    "ボカコレ2026夏ルーキー参加曲",
    "ボカコレ2026夏ex",
  ];
  const honTag = "VOCAROCK";
  const topN = 50; // 上位N曲を取得する
  const data2D = aggregate(vocTags, honTag, d1, d2, "集計結果", topN);
  writeToSheet("集計結果", data2D);
}
