/** β版チーム戦補正のタグ判定、差分、入力データ非変更を検証する。 */
function testApplyBetaTeamBattlePenalty(): void {
  const teamBattleTag = "本ネクβ版チーム戦";
  const makeItem = (
    id: string,
    d1Tags: string,
    d2Tags: string,
    mylist: number,
    like: number,
  ): AggregateItem => ({
    id,
    title: id,
    tags: d2Tags || d1Tags,
    startTime: null,
    type: "Y",
    d1: {
      title: id,
      tags: d1Tags,
      startTime: null,
      view: 0,
      like: 0,
      comment: 0,
      mylist: 0,
    },
    d2: {
      title: id,
      tags: d2Tags,
      startTime: null,
      view: 0,
      like: 0,
      comment: 0,
      mylist: 0,
    },
    diff: { view: 0, like, comment: 0, mylist },
  });
  const items = [
    makeItem("d1", teamBattleTag, "", 5, 3),
    makeItem("d2", "", `音楽 ${teamBattleTag}`, 8, 2),
    makeItem("partial", `${teamBattleTag}参加`, "", 4, 1),
  ];

  const results = applyBetaTeamBattlePenalty(items, teamBattleTag);
  if (results[0].diff.mylist !== 4 || results[1].diff.mylist !== 7) {
    throw new Error("チーム戦タグのマイリス差分が補正されていません");
  }
  if (results[2].diff.mylist !== 4 || items[0].diff.mylist !== 5) {
    throw new Error("タグの完全一致または入力データの非変更に失敗しました");
  }
  if (results[0].diff.like !== 3) {
    throw new Error("マイリス以外の差分が変更されています");
  }
}

/** GAS上で対象動画を抽出し、集計結果をシートへ書き込む。 */
function testAggregateAndWrite(): void {
  const candidateSheetName = "2026/08/23";
  const d1 = "2026/08/22";
  const d2 = "2026/08/23";
  const vocTags = [
    "ボカコレ2026夏TOP100ランキング参加曲",
    "ボカコレ2026夏ルーキー参加曲",
    "ボカコレ2026夏ex",
  ];
  const honTag = "VOCAROCK";
  const topN = 50;
  const excludeTags = ["ボカコレ2026夏REMIX参加曲"];
  const startTimeFrom = "2026-09-18T17:00:00+09:00";
  const startTimeTo = "2026-09-20T00:00:00+09:00";
  const contentIds = getTargetContentIds(
    candidateSheetName,
    vocTags,
    honTag,
    excludeTags,
    startTimeFrom,
    startTimeTo,
  );
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss.getSheetByName(d1) || !ss.getSheetByName(d2)) {
    throw new Error("集計元シートが見つかりません");
  }

  const outputData = buildAggregateOutputData(
    contentIds,
    vocTags,
    getSheetAsObjects(d1),
    getSheetAsObjects(d2),
    d1,
    d2,
    topN,
    "本ネクβ版チーム戦",
  );
  writeAggregateOutput("集計結果", outputData);
}

/** topNがnullの場合に対象動画をすべて上位一覧へ含める。 */
function testBuildAggregateOutputDataWithoutTopNLimit(): void {
  const outputData = buildAggregateOutputData(
    ["sm1", "sm2"],
    [],
    [],
    [],
    "d1",
    "d2",
    null,
    null,
  );
  if (outputData[0][0] !== "上位2曲（マイリス差分順）") {
    throw new Error("topNがnullの場合に全件が上位一覧へ含まれていません");
  }
  if (outputData[1][16] !== "差分_マイリス") {
    throw new Error(
      "チーム戦タグが未指定なのに補正用の見出しが表示されています",
    );
  }
}
