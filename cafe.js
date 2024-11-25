import puppeteer from "puppeteer";

/**
 * 카페 대문 수정
 * @param {{NAVER_CAFE_ID:string;NID_AUT:string;NID_SES:string;CHZZK_IMAGE_SRC:string;chzzk:boolean;youtube:string|null}} data
 * @returns {Promise<string|null>} 유튜브 최신 영상 ID (검색 불가능할 경우 null)
 */
async function updateCafe(data) {
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
        `src="https://chatbot.bighead033.com/api/cafe/live?random=${random}"`
      );
    }

    if (data.youtube) {
      const youtubeUrl = `https://www.youtube.com/embed/${data.youtube}`;
      content = content.replace(
        /<iframe[^>]*src="[^"]*"[^>]*>/,
        `<iframe src="${youtubeUrl}" width="560px" height="315px" frameborder="0" scrolling="no" allowfullscreen="">`
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
    console.error("Error updating cafe header:", error);
  } finally {
    await browser.close();
  }
}

export default updateCafe;
