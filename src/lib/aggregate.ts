type VideoStatistics = {
  title: string;
  tags: string;
  startTime: SheetCell;
  view: number;
  like: number;
  comment: number;
  mylist: number;
};

type AggregateItem = {
  id: string;
  title: string;
  tags: string;
  startTime: SheetCell;
  type: "X" | "Y";
  d1: VideoStatistics;
  d2: VideoStatistics;
  diff: {
    view: number;
    like: number;
    comment: number;
    mylist: number;
  };
};

/**
 * 候補シートから集計条件に合う動画のcontentIdを抽出する。
 * @param candidateSheetName 候補動画が記録されたシート名
 * @param vocTags ボカコレ参加タグ
 * @param honTag 本ネク参加タグ
 * @param excludeTags 除外するタグ
 * @param startTimeFrom 新規投稿曲の期間開始
 * @param startTimeTo 新規投稿曲の期間終了（この日時は含まない）
 * @returns 集計対象のcontentId
 */
function getTargetContentIds(
  candidateSheetName: string,
  vocTags: string[],
  honTag: string | string[],
  excludeTags: string[] = [],
  startTimeFrom: string | null = null,
  startTimeTo: string | null = null,
): string[] {
  const data = getSheetAsObjects(candidateSheetName);
  if (data.length === 0) return [];

  const excludeData = getSheetAsObjects("exclude");
  const excludeSet = new Set(
    excludeData
      .map((row) => String(row["contentId"] ?? "").trim())
      .filter(Boolean),
  );

  const hasExcludeTag = (tags: string): boolean =>
    excludeTags.some((tag) => tags.includes(tag));
  const hasVoc = (tags: string): boolean =>
    vocTags.some((tag) => tags.includes(tag));
  const hasHon = (tags: string): boolean =>
    Array.isArray(honTag)
      ? honTag.some((tag) => tags.includes(tag))
      : tags.includes(honTag);
  const isWithinPeriod = (startTime: SheetCell): boolean => {
    if (!startTimeFrom && !startTimeTo) return true;
    if (!startTime) return false;

    const time =
      startTime instanceof Date
        ? startTime.getTime()
        : new Date(String(startTime)).getTime();
    if (!Number.isFinite(time)) return false;
    if (startTimeFrom && time < new Date(startTimeFrom).getTime()) return false;
    if (startTimeTo && time >= new Date(startTimeTo).getTime()) return false;
    return true;
  };

  return data.flatMap((row) => {
    const id = String(row["contentId"] ?? "").trim();
    const tags = String(row["tags"] ?? "");
    const startTime = row["startTime"] ?? null;
    if (
      !id ||
      excludeSet.has(id) ||
      hasExcludeTag(tags) ||
      !hasHon(tags) ||
      (!hasVoc(tags) && !isWithinPeriod(startTime))
    ) {
      return [];
    }
    return [id];
  });
}

/**
 * β版チーム戦タグが付いた動画のマイリス差分を1減算する。
 * @param items 補正前の集計済み動画データ
 * @returns 補正後の動画データ
 */
function applyBetaTeamBattlePenalty(items: AggregateItem[]): AggregateItem[] {
  const teamBattleTag = "本ネクβ版チーム戦";
  return items.map((item) => {
    const tags = [item.d1.tags, item.d2.tags].join(" ").split(/\s+/);
    if (!tags.includes(teamBattleTag)) return item;

    return {
      ...item,
      diff: {
        ...item.diff,
        mylist: item.diff.mylist - 1,
      },
    };
  });
}

/**
 * 2時点のシートデータを集計し、順位表と一覧の書き込み用データを作成する。
 * シートの読み込みと書き込みは行わない。
 * @param contentIds 集計対象の動画ID
 * @param vocTags ボカコレ参加タグ
 * @param data1 開始日時点の動画レコード
 * @param data2 終了日時点の動画レコード
 * @param d1 開始日時点のシート名
 * @param d2 終了日時点のシート名
 * @param topN 上位一覧に表示する件数
 * @param betaTeamBattlePenaltyEnabled β版チーム戦補正を適用するか
 * @returns シートへの書き込み用データ
 */
function buildAggregateOutputData(
  contentIds: string[],
  vocTags: string[],
  data1: SheetRecord[],
  data2: SheetRecord[],
  d1: string,
  d2: string,
  topN = 30,
  betaTeamBattlePenaltyEnabled = true,
): SheetCell[][] {
  const toMap = (records: SheetRecord[]): Map<string, VideoStatistics> => {
    const map = new Map<string, VideoStatistics>();
    records.forEach((row) => {
      const id = String(row["contentId"] ?? "").trim();
      if (!id) return;
      map.set(id, {
        title: String(row["title"] ?? ""),
        tags: String(row["tags"] ?? ""),
        startTime: row["startTime"] ?? null,
        view: Number(row["viewCounter"]) || 0,
        like: Number(row["likeCounter"]) || 0,
        comment: Number(row["commentCounter"]) || 0,
        mylist: Number(row["mylistCounter"]) || 0,
      });
    });
    return map;
  };

  const map1 = toMap(data1);
  const map2 = toMap(data2);
  const hasVoc = (tags: string): boolean =>
    vocTags.some((tag) => tags.includes(tag));
  const emptyStats: VideoStatistics = {
    title: "",
    tags: "",
    startTime: null,
    view: 0,
    like: 0,
    comment: 0,
    mylist: 0,
  };

  const combined: AggregateItem[] = contentIds.map((id) => {
    const val1 = map1.get(id) ?? emptyStats;
    const val2 = map2.get(id) ?? emptyStats;
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

  const results = betaTeamBattlePenaltyEnabled
    ? applyBetaTeamBattlePenalty(combined)
    : combined;
  const listX = results.filter((item) => item.type === "X");
  const listY = results.filter((item) => item.type === "Y");
  results.sort((a, b) => {
    if (b.diff.mylist !== a.diff.mylist) return b.diff.mylist - a.diff.mylist;
    if (b.diff.like !== a.diff.like) return b.diff.like - a.diff.like;
    return b.diff.comment - a.diff.comment;
  });

  const displayCount = Math.min(topN, results.length);
  const topList = results.slice(0, displayCount);
  const formatRows = (list: AggregateItem[]): SheetCell[][] =>
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
    betaTeamBattlePenaltyEnabled
      ? "差分_マイリス（β版チーム戦は-1補正）"
      : "差分_マイリス",
  ];

  return [
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
}

/**
 * 集計結果の二次元配列を指定したシートへ書き込む。
 * @param sheetName 書き込み先のシート名
 * @param outputData buildAggregateOutputDataが返す二次元配列
 */
function writeAggregateOutput(
  sheetName: string,
  outputData: SheetCell[][],
): void {
  writeToSheet(sheetName, outputData);
}