# 블로그 포스팅 규칙

## 포스팅 구조

### 1. 파일 위치
- 모든 블로그 포스트는 `posts/` 폴더에 저장
- 파일명: `{slug}.html` 형식 (예: `iccv-2025-hawaii.html`)

### 2. 메타데이터 (posts/index.json)
각 포스트는 다음 정보를 포함해야 합니다:

```json
{
  "slug": "포스트-슬러그",
  "title": "포스트 제목",
  "date": "YYYY-MM-DD",
  "summary": "포스트 요약 (1-2문장)",
  "tags": ["태그1", "태그2", "태그3"],
  "cover": "assets/images/이미지파일.jpg",
  "category": "분류명"
}
```

### 3. 분류 시스템
포스트는 다음 분류 중 하나에 속해야 합니다:
- **Conference**: 학회 발표, 컨퍼런스 참석 관련
- **Talk**: 강연, 발표, 토크 관련
- **Research**: 연구 관련 포스트
- **Travel**: 여행, 출장 관련
- **Personal**: 개인적인 이야기
- **Tutorial**: 튜토리얼, 가이드
- **News**: 뉴스, 소식

### 4. HTML 구조
포스트 HTML 파일은 다음 구조를 따라야 합니다:

```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>포스트 제목 • Post</title>
    <link rel="stylesheet" href="../assets/css/styles.css" />
</head>
<body>
    <main class="container">
        <article class="blog-post-content reveal">
            <h1>포스트 제목</h1>
            <div class="post-meta">날짜 • 태그</div>
            <!-- 포스트 내용 -->
        </article>
    </main>
</body>
</html>
```

### 5. Quick Navigation 자동 생성
- 모든 포스트에서 우측 하단에 Quick Navigation 버튼이 자동으로 생성됩니다
- 클릭 시 포스트 내 헤딩(h1, h2, h3, h4, h5, h6)으로 바로가기 가능
- 헤딩에 ID가 자동으로 부여됩니다

### 6. 이미지 규칙
- 커버 이미지는 `assets/images/` 폴더에 저장
- 권장 크기: 800x600px 이상
- 파일 형식: JPG, PNG, WebP

### 7. 태그 규칙
- 태그는 영어로 작성
- 첫 글자는 대문자 (예: "Conference", "Travel")
- 공백이 있는 경우 CamelCase 사용 (예: "Multimodal Learning")
- 태그는 `#` 기호로 표시됩니다

### 8. 날짜 형식
- ISO 8601 형식 사용: `YYYY-MM-DD`
- 예: `2025-10-15`

### 9. 제목 규칙
- 명확하고 설명적인 제목 사용
- 특수문자 사용 금지
- 길이: 50자 이내 권장

### 10. 요약 규칙
- 포스트의 핵심 내용을 1-2문장으로 요약
- 길이: 100자 이내 권장
- 검색 시 사용됩니다

## 예시

### Conference 포스트 예시
```json
{
  "slug": "iccv-2025-hawaii",
  "title": "ICCV 2025 Hawaii — A Journey Through Computer Vision",
  "date": "2025-10-15",
  "summary": "My experience at ICCV 2025 in Hawaii, exploring the latest advances in computer vision and multimodal learning.",
  "tags": ["Conference", "Travel", "Multimodal Learning"],
  "cover": "assets/images/profile.jpeg",
  "category": "Conference"
}
```

### Talk 포스트 예시
```json
{
  "slug": "hello-world",
  "title": "Hello, world",
  "date": "2025-10-04",
  "summary": "First post.",
  "tags": ["intro"],
  "cover": "assets/images/profile.jpeg",
  "category": "Talk"
}
```

## 주의사항

1. **분류 일관성**: 같은 성격의 포스트는 같은 분류를 사용하세요
2. **슬러그 고유성**: 각 포스트의 슬러그는 고유해야 합니다
3. **이미지 최적화**: 이미지는 웹 최적화를 위해 압축하세요
4. **접근성**: 모든 이미지에 alt 텍스트를 제공하세요
5. **모바일 친화적**: 콘텐츠가 모바일에서도 잘 보이도록 작성하세요
