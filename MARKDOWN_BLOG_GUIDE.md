# Markdown Blog System

이 시스템을 사용하면 마크다운 파일로 쉽게 블로그 포스트를 작성할 수 있습니다.

## 📁 디렉토리 구조

```
posts/
├── markdown/          # 마크다운 소스 파일들 (.md)
│   ├── getting-started.md
│   └── research-journey.md
├── *.html             # 변환된 HTML 파일들 (자동 생성)
└── index.json         # 포스트 메타데이터 (자동 업데이트)
```

## ✍️ 마크다운 파일 작성법

### 1. Frontmatter (메타데이터)

각 마크다운 파일은 다음 형식으로 시작해야 합니다:

```yaml
---
title: "포스트 제목"
description: "포스트에 대한 간단한 설명"
date: "2025-01-15"
tags: ["태그1", "태그2", "태그3"]
category: "카테고리"
---
```

### 2. 마크다운 문법

#### 제목
```markdown
# 메인 제목 (H1)
## 섹션 제목 (H2)
### 하위 섹션 (H3)
```

#### 텍스트 서식
```markdown
**굵은 글씨**
*기울임 글씨*
`인라인 코드`
```

#### 목록
```markdown
- 순서 없는 목록
- 두 번째 항목
- 세 번째 항목

1. 순서 있는 목록
2. 두 번째 항목
3. 세 번째 항목
```

#### 링크
```markdown
[링크 텍스트](https://example.com)
```

#### 코드 블록
````markdown
```python
def hello_world():
    print("Hello, World!")
    return "Success"
```
````

## 🔄 변환 과정

### 1. 마크다운 파일 작성
`posts/markdown/` 디렉토리에 `.md` 파일을 작성합니다.

### 2. 변환 실행
```bash
python convert_markdown.py
```

### 3. 결과 확인
- `posts/` 디렉토리에 `.html` 파일이 생성됩니다
- `posts/index.json`이 자동으로 업데이트됩니다

## 📝 예제 파일

### getting-started.md
```yaml
---
title: "Getting Started with Markdown Blogging"
description: "A guide to writing blog posts using Markdown format."
date: "2025-01-15"
tags: ["Tutorial", "Markdown", "Blogging"]
category: "Tutorial"
---

# Getting Started with Markdown Blogging

Welcome to the new **Markdown-based blogging system**!

## Why Markdown?

Markdown is a lightweight markup language that allows you to:

- Write content in plain text
- Focus on content rather than formatting
- Use simple syntax for common formatting needs
```

## 🚀 사용법

1. **새 포스트 작성**:
   ```bash
   # posts/markdown/ 디렉토리에 새 .md 파일 생성
   touch posts/markdown/my-new-post.md
   ```

2. **포스트 편집**:
   - Frontmatter 작성
   - 마크다운 콘텐츠 작성

3. **변환 실행**:
   ```bash
   python convert_markdown.py
   ```

4. **결과 확인**:
   - 웹사이트에서 새 포스트 확인
   - 블로그 페이지에서 포스트 목록 확인

## ⚙️ 설정

### .gitignore
다음 파일들은 Git에서 제외됩니다:
- `/posts/markdown/` (마크다운 소스 파일들)
- `/posts/*.html` (변환된 HTML 파일들)
- `!/posts/index.json` (인덱스 파일은 포함)

### 자동화
변환 스크립트를 자동화하려면:
```bash
# 파일 변경 감지 시 자동 변환 (Linux/Mac)
fswatch -o posts/markdown/ | xargs -n1 python convert_markdown.py
```

## 🎯 장점

- ✅ **간단한 문법**: HTML보다 훨씬 쉽게 작성
- ✅ **자동 변환**: 마크다운을 HTML로 자동 변환
- ✅ **메타데이터 관리**: Frontmatter로 자동 메타데이터 처리
- ✅ **일관된 스타일**: 모든 포스트가 동일한 HTML 템플릿 사용
- ✅ **자동 인덱싱**: `index.json` 자동 업데이트
- ✅ **Git 관리**: 소스 파일만 Git에 포함, 변환 파일은 제외

## 🔧 문제 해결

### 태그가 제대로 파싱되지 않는 경우
Frontmatter에서 태그 형식을 확인하세요:
```yaml
tags: ["Tag1", "Tag2", "Tag3"]  # 올바른 형식
```

### 날짜 형식 문제
날짜는 다음 형식 중 하나를 사용하세요:
- `"2025-01-15"` (YYYY-MM-DD)
- `"January 15, 2025"`

### 변환 오류
1. 마크다운 파일의 Frontmatter 형식 확인
2. Python 스크립트 실행 권한 확인
3. 파일 인코딩이 UTF-8인지 확인

---

**Happy Blogging!** 🎉
