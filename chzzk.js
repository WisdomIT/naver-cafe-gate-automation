import { ChzzkClient } from "chzzk";

const client = new ChzzkClient();

/**
 * 치지직 라이브 상태 확인
 * @param {string} channelId
 * @returns 라이브 상태 반환 (검색 불가능할 경우 null)
 */
async function getChzzkLiveDetail(channelId) {
  const result = await client.live.detail(channelId);

  if (result)
    return {
      status: result.status,
      title: result.liveTitle,
      category: result.liveCategoryValue,
    };

  return null;
}

export default getChzzkLiveDetail;
