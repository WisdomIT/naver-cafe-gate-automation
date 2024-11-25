import "dotenv/config";

const NID_AUT = process.env.NID_AUT;
const NID_SES = process.env.NID_SES;
const NAVER_CAFE_ID = process.env.NAVER_CAFE_ID;
const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
const CHZZK_CHANNEL_ID = process.env.CHZZK_CHANNEL_ID;
const CHZZK_IMAGE_SRC = process.env.CHZZK_IMAGE_SRC;

import getChzzkLiveDetail from "./chzzk.js";
import getYoutubeDetail from "./youtube.js";
import updateCafe from "./cafe.js";

const lastState = {
  chzzk: null,
  youtube: null,
};

function isChzzkChanged(last, current) {
  if (last === null && current === null) return false;

  if (
    (last === null && current !== null) ||
    (last !== null && current === null)
  )
    return true;

  if (last.status !== current.status) return true;
  if (last.title !== current.title) return true;
  if (last.category !== current.category) return true;

  return false;
}

async function main() {
  if (
    !NID_AUT ||
    !NID_SES ||
    !NAVER_CAFE_ID ||
    !YOUTUBE_CHANNEL_ID ||
    !CHZZK_CHANNEL_ID ||
    !CHZZK_IMAGE_SRC
  ) {
    console.error(".env 내용을 확인해주세요");
    return;
  }

  const chzzk = await getChzzkLiveDetail(CHZZK_CHANNEL_ID);
  const youtube = await getYoutubeDetail(YOUTUBE_CHANNEL_ID);

  const changed = {
    chzzk: false,
    youtube: false,
  };

  if (isChzzkChanged(lastState.chzzk, chzzk)) {
    lastState.chzzk = chzzk;
    changed.chzzk = true;
  }

  if (lastState.youtube !== youtube) {
    lastState.youtube = youtube;
    changed.youtube = true;
  }

  if (changed.chzzk || changed.youtube)
    updateCafe({
      NAVER_CAFE_ID,
      NID_AUT,
      NID_SES,
      CHZZK_IMAGE_SRC,
      chzzk: changed.chzzk,
      youtube: changed.youtube ? youtube : null,
    });
}

main();
