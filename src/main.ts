/** ニコニコ動画から対象動画を取得し、当日分のシートへ書き込む。 */
function runFetchAndWrite(): void {
  const tags = [
    "ボカコレ2026夏TOP100ランキング参加曲",
    "ボカコレ2026夏ルーキー参加曲",
    "ボカコレ2026夏REMIX参加曲",
    "ボカコレ2026夏ex",
    "本ネク新世界2026",
  ];
  const videos = getVideosByTags(tags);
  const fields: (keyof NiconicoVideo & string)[] = [
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

/** 対象動画と2時点のデータを集計し、結果シートへ順に書き込む。 */
function runAggregateAndWrite(): void {
  const candidateSheetName = "2026/09/20";
  const vocTags = [
    "ボカコレ2026夏TOP100ランキング参加曲",
    "ボカコレ2026夏ルーキー参加曲",
    "ボカコレ2026夏REMIX参加曲",
    "ボカコレ2026夏ex",
  ];
  const honTag = "本ネク新世界2026";
  const excludeTags: string[] = [];
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

  const d1 = "2026/09/18";
  const d2 = "2026/10/01";
  const topN = 30;
  const betaTeamBattleTag = "本ネクβ版チーム戦";
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss.getSheetByName(d1) || !ss.getSheetByName(d2)) return;

  const outputData = buildAggregateOutputData(
    contentIds,
    vocTags,
    getSheetAsObjects(d1),
    getSheetAsObjects(d2),
    d1,
    d2,
    topN,
    betaTeamBattleTag,
  );
  writeAggregateOutput("集計結果", outputData);
}
