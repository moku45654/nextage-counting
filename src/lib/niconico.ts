interface NiconicoVideo extends Record<string, SheetCell> {
  contentId: string;
  title: string;
  description?: string;
  userId?: string | number;
  channelId?: string | number;
  viewCounter?: number;
  mylistCounter?: number;
  likeCounter?: number;
  lengthSeconds?: number;
  thumbnailUrl?: string;
  startTime?: string;
  commentCounter?: number;
  tags: string;
}

interface NiconicoSearchResponse {
  meta: {
    status: number;
  };
  data?: NiconicoVideo[];
}

/** 指定タグのいずれかを含む動画をニコニコ動画APIから取得する。 */
function getVideosByTags(tags: string[]): NiconicoVideo[] {
  if (tags.length === 0) return [];

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
  let allVideos: NiconicoVideo[] = [];
  const query = tags.join(" OR ");

  while (true) {
    const url = `${endpoint}?q=${encodeURIComponent(query)}&targets=tagsExact&fields=${fields.join(",")}&_sort=-startTime&_limit=${limit}&_offset=${offset}`;
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const json = JSON.parse(
      response.getContentText(),
    ) as NiconicoSearchResponse;

    if (json.meta.status !== 200 || !json.data || json.data.length === 0) {
      break;
    }

    allVideos = allVideos.concat(json.data);
    if (json.data.length < limit || offset + limit >= 100000) break;

    offset += limit;
    Utilities.sleep(500);
  }

  return allVideos;
}
