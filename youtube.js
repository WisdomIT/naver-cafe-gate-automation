import { XMLParser } from "fast-xml-parser";

/**
 * 유튜브 최신 영상 확인
 * @param {string} channelId
 * @returns {Promise<string|null>} 유튜브 최신 영상 ID (검색 불가능할 경우 null)
 */
async function getYoutubeDetail(channelId) {
  const youtubeUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const request = await fetch(youtubeUrl);
  const body = await request.text();

  if (!body) return null;

  try {
    const parser = new XMLParser();
    const result = parser.parse(body);

    const videoList = result.feed.entry;
    const lastVideo = videoList[0];

    return lastVideo["yt:videoId"];
  } catch {
    return null;
  }
}

export default getYoutubeDetail;
