import puppeteer from "puppeteer";

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5초 대기

/**
 * 카페 대문 수정
 * @param {{NAVER_CAFE_ID:string;NID_AUT:string;NID_SES:string;CHZZK_IMAGE_SRC:string;YOUTUBE_WIDTH:string;YOUTUBE_HEIGHT:string;chzzk:boolean;youtube:string|null}} data
 * @param {number} retryCount? 재시도 횟수
 * @returns {Promise<string|null>} 유튜브 최신 영상 ID (검색 불가능할 경우 null)
 */
async function updateCafe(data, retryCount = 0) {
  if (!data.chzzk && !data.youtube) return;

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );

  const cookies = [
    {
      name: "NID_AUT",
      value: data.NID_AUT,
      domain: ".naver.com",
      path: "/",
    },
    {
      name: "NID_SES",
      value: data.NID_SES,
      domain: ".naver.com",
      path: "/",
    },
  ];

  await page.setCookie(...cookies);

  try {
    // alert 창 자동 처리 설정
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    const gateEditorURL = `https://cafe.naver.com/ManageGateEditor.nhn?clubid=${data.NAVER_CAFE_ID}`;
    const option = {
      waitUntil: "networkidle0",
      timeout: 30000,
    };

    await page.goto(gateEditorURL, option);

    // iframe 대기 및 전환
    const frameHandle = await page.waitForSelector('iframe[name="cafe_main"]');
    const frame = await frameHandle.contentFrame();

    await frame.waitForSelector("#elHtmlMode");
    await frame.click("#elHtmlMode");

    const textarea = await frame.waitForSelector('textarea[name="content"]');
    let content = await textarea.evaluate((el) => el.value);

    if (data.chzzk) {
      const random = Math.floor(Math.random() * 1000000);
      content = content.replace(
        /src="[^"]*"(?=[^>]*alt="chzzk-automation")/,
        `src="${data.CHZZK_IMAGE_SRC}?random=${random}"`
      );
    }

    if (data.youtube) {
      const youtubeUrl = `https://www.youtube.com/embed/${data.youtube}`;
      content = content.replace(
        /<iframe[^>]*src="[^"]*"[^>]*>/,
        `<iframe src="${youtubeUrl}" width="${data.YOUTUBE_WIDTH}" height="${data.YOUTUBE_HEIGHT}" frameborder="0" scrolling="no" allowfullscreen="">`
      );
    }

    await textarea.evaluate((el, value) => {
      el.value = value;
    }, content);

    await Promise.all([
      page.waitForNavigation({ timeout: 30000 }),
      page.click("a._click\\(ManageGateEditor\\|Submit\\)"),
    ]);
  } catch (error) {
    console.error(
      `Error updating cafe header (attempt ${retryCount + 1}):`,
      error
    );

    await browser.close();

    if (retryCount < MAX_RETRIES) {
      console.log(
        `Retrying in ${RETRY_DELAY / 1000} seconds... (${
          retryCount + 1
        }/${MAX_RETRIES})`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return updateCafe(data, retryCount + 1);
    } else {
      console.error(`Failed after ${MAX_RETRIES} attempts`);
      throw error; // 최대 시도 횟수 초과 시 에러 던지기
    }
  } finally {
    await browser.close();
  }
}

export default updateCafe;
