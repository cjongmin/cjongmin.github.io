# 사진 앨범 넣는 방법

`gallery/` 아래의 **폴더 하나가 앨범 하나**예요. 폴더 이름이 주소가 돼요.
(`gallery/sydney-2026/` → https://cjmin.me/gallery/sydney-2026/)

```
gallery/
├── gallery.json          홈페이지에 보여 줄 사진 (최대 3장, 첫 장이 크게)
├── budapest/
│   ├── album.json        앨범 제목, 맥락, 사진 순서와 설명
│   ├── IMG_0090.jpg      ← 원본은 git에 올라가지 않아요
│   └── IMG_1373 2.heic
└── sydney-2026/          ← 새 앨범은 이렇게 폴더만 만들면 돼요
    └── ...
```

## 사진을 추가할 때

1. `gallery/<앨범 이름>/` 폴더를 만들고 휴대폰 사진을 **원본 그대로** 넣어 주세요.
   - 폴더 이름은 영어 소문자와 하이픈으로 지어 주세요. 예: `sydney-2026`, `jeju-trip`
   - JPG, PNG, WebP, HEIC 모두 돼요. 크기를 줄이거나 변환할 필요가 없어요.
   - 앨범 안에 또 폴더를 만들 수는 없어요. 한 단계만 돼요.
2. Claude에게 아래 내용을 알려 주세요. 모르는 항목은 비워 두어도 돼요.
   - **제목과 맥락**: 예) `Sydney`, `NeurIPS 2026`
   - **표지**로 쓸 사진
   - **사진 순서와 설명**: 없으면 찍은 시간순이고 설명은 비어 있어요
   - **홈페이지에 보여 줄 사진** 3장 (첫 장이 크게 나와요)
3. Claude가 사진을 처리해 배포해요.

## 공개되는 것과 공개되지 않는 것

- **공개되지 않아요**: 이 폴더의 원본 사진, GPS 위치, 촬영 기기와 시각 같은 메타데이터. 원본은 `.gitignore`로 제외되어 공개 저장소에 올라가지 않아요.
- **공개돼요**: `public/gallery/`에 만들어지는 작은 사본(WebP). 메타데이터를 지우고, 지워졌는지 확인한 뒤 저장해요.
- 사진에 **찍힌 것**은 그대로 보여요. 다른 사람의 얼굴, 명찰, 화면 속 내용은 올리기 전에 한 번 봐 주세요.

## album.json

모든 항목은 선택이에요. 없으면 폴더 이름과 사진 정보로 채워요.

```json
{
  "title": "Budapest",
  "context": "EMNLP 2026",
  "date": "October 2026",
  "cover": "IMG_0090.jpg",
  "link": { "label": "Read the EMNLP 2026 notes", "href": "/talks/1/" },
  "photos": [
    { "file": "IMG_0090.jpg", "caption": "The Hungarian Parliament reflected in the Danube." },
    { "file": "IMG_1373 2.heic", "caption": "With my poster at EMNLP 2026.", "position": "left top" }
  ]
}
```

| 항목 | 뜻 |
|---|---|
| `title`, `context`, `date` | 앨범 제목, 맥락, 시기. `date`가 없으면 찍은 날짜에서 만들어요 |
| `cover` | 폴더에 보이는 사진. 없으면 첫 사진 |
| `link` | 앨범 위에 표시할 관련 글 링크 |
| `photos` | 여기 적은 순서대로 먼저 보여 주고, 나머지는 찍은 시간순이에요 |
| `caption`, `alt` | 사진 설명, 화면 낭독기용 설명 (`alt`가 없으면 `caption`을 써요) |
| `position` | 네모 칸에 맞춰 자를 때 남길 부분. 예: `left top` (확대 화면은 자르지 않아요) |
| `sort` | 앨범 정렬용 날짜. 없으면 가장 최근에 찍은 날짜를 써요 (최신 앨범이 먼저) |

## 직접 처리할 때

```bash
pip install pillow pillow-heif
python3 scripts/build_gallery.py      # public/gallery/와 src/data/gallery.json을 다시 만들어요
npm run build
npx wrangler pages deploy dist --project-name cjmin --branch main
```

사진을 폴더에서 지우고 다시 실행하면 사이트에서도 빠져요. 이미 처리한 사진은 다시 처리하지 않아요.
`public/gallery/`와 `src/data/gallery.json`은 스크립트가 만드는 파일이라 직접 고치지 마세요.
이 두 곳은 git에 들어가므로, 원본이 없어도 사이트는 그대로 다시 배포할 수 있어요.
