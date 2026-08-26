function getVideosByTags(tags) {
  // タグが指定されていない場合は空の配列を返す
  if (!tags || tags.length === 0) return [];

  const endpoint =
    "https://snapshot.search.nicovideo.jp/api/v2/snapshot/video/contents/search";
  const fields = [
    "contentId",
    "title",
    "description",
    "userId",
    "channelId",
    "viewCounter",
    "mylistCounter",
    "likeCounter",
    "lengthSeconds",
    "thumbnailUrl",
    "startTime",
    "commentCounter",
    "tags",
  ];
  const limit = 100;
  let offset = 0;
  let allVideos = [];

  // タグを OR 条件で結合して検索クエリを作成
  const query = tags.join(" OR ");

  while (true) {
    const url = `${endpoint}?q=${encodeURIComponent(query)}&targets=tagsExact&fields=${fields.join(",")}&_sort=-startTime&_limit=${limit}&_offset=${offset}`;

    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const json = JSON.parse(response.getContentText());

    if (json.meta.status !== 200 || !json.data || json.data.length === 0) {
      break;
    }

    allVideos = allVideos.concat(json.data);

    if (json.data.length < limit || offset + limit >= 100000) {
      break;
    }

    offset += limit;
    Utilities.sleep(500);
  }

  // 例)
  // [
  //   {
  //     "contentId": "sm12345678",
  //     "title": "テスト動画タイトル",
  //     "tags": "ボカロ 音楽"
  //   },
  //   {
  //     "contentId": "sm87654321",
  //     "title": "サンプル動画",
  //     "tags": "UTAU"
  //   }
  // ]
  return allVideos;
}
