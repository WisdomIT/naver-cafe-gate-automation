# NAVER-CAFE-GATE-AUTOMATION

네이버 카페 대문을 자동화하는 프로젝트입니다.

## Environments

- Node.js >= 18
- puppeteer 사용 가능한 OS 환경

## Getting Started

본 레포지토리를 clone하거나 zip으로 다운받아 실행할 수 있습니다.

실행 전 `.env` 파일이 작성되어야 합니다.

```properties
#NAVER AUTHENTICATION
NID_AUT={네이버 NID_AUT 쿠키}
NID_SES={네이버 NID_SES 쿠키}

#CAFE INFO
NAVER_CAFE_ID={카페 관리 페이지 clubid}

#YOUTUBE INFO
YOUTUBE_CHANNEL_ID={유튜브 channelId}
YOUTUBE_WIDTH=560px
YOUTUBE_HEIGHT=315px

#CHZZK INFO
CHZZK_CHANNEL_ID={치지직 channelId}
CHZZK_IMAGE_SRC={치지직 상태표시용 이미지 소스}
```

`node`에서 `index.js`를 직접 실행하거나, `pm2`를 활용하여 백그라운드에서 실행합니다.

## References

현재 다음과 같은 카페에서 사용되고 있습니다

- [빅헤드 대가리숲](https://cafe.naver.com/bighead033)
- [뫄사카](https://cafe.naver.com/mamwa)
