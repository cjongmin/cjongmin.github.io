# iOS 앱 정보 추출 프롬프트

프로필 페이지의 **Projects** 섹션에 앱을 추가할 때 사용합니다.

**사용법**: 앱 소스 폴더에서 Claude Code를 열고, 아래 `---` 이하 프롬프트 전체를 붙여넣으세요.
Claude가 `projects.json`에 넣을 JSON 엔트리와 복사할 이미지 에셋 목록을 만들어 줍니다.

결과물 적용:
1. 출력된 JSON 객체를 `profilepage/src/data/projects.json` 배열에 추가
2. 안내된 아이콘/스크린샷 파일을 `profilepage/public/projects/<app-id>/`에 복사
3. `npm run dev`로 확인

---

이 폴더는 내가 개발한 iOS 앱의 소스코드야. 내 프로필 웹사이트의 Projects 섹션에 이 앱을 소개하려고 해. 프로젝트를 분석해서 아래 JSON 스키마에 맞는 엔트리 하나를 만들어줘.

## 분석할 것

1. **앱 기본 정보**: 앱 이름(디스플레이 네임), 번들 ID, 지원 플랫폼과 최소 OS 버전
   - `Info.plist`, `project.pbxproj`(또는 `Package.swift`)의 `CFBundleDisplayName`, `DEPLOYMENT_TARGET`, `TARGETED_DEVICE_FAMILY` 확인
2. **기능 파악**: 소스 코드(뷰, 뷰모델, 서비스 레이어)를 읽고 사용자가 실제로 할 수 있는 것 3–5개를 요약
3. **기술 스택**: 언어(Swift 버전), UI 프레임워크(SwiftUI/UIKit), 아키텍처 패턴(MVVM 등), 동시성(async/await, Combine)
4. **프레임워크 & API**: import 문과 의존성에서 추출
   - Apple 프레임워크: CoreData, SwiftData, CloudKit, StoreKit, WidgetKit, HealthKit, MapKit, AVFoundation, Vision 등
   - 서드파티: `Package.swift` / `Podfile` / `*.xcodeproj`의 패키지 의존성 (Firebase, Alamofire 등)
   - 외부 API 서버: 네트워크 레이어의 base URL로 어떤 서비스를 쓰는지
   - 권한: `*.entitlements`와 Info.plist의 usage description들 (푸시, 위치, 카메라 등)
5. **에셋 위치**:
   - 앱 아이콘: `Assets.xcassets/AppIcon.appiconset/`에서 가장 큰 PNG (1024px 권장)
   - 스크린샷: `fastlane/screenshots/`, App Store 메타데이터 폴더, 또는 리포지토리 내 스크린샷이 있으면 경로 나열 (세로형 우선, 3–5장)

## 출력 형식

### 1) JSON 엔트리 (아래 스키마 준수)

```json
{
  "id": "앱이름-kebab-case",
  "name": "앱 디스플레이 이름",
  "tagline": "카드에 표시될 한 줄 소개 (60자 이내, 영어)",
  "description": "2–3개 문단. 문단 구분은 \\n\\n. 어떤 문제를 풀고, 어떻게 동작하며, 기술적으로 흥미로운 점은 무엇인지. (영어)",
  "icon": "/projects/<id>/icon.png",
  "accentColor": "#RRGGBB (아이콘의 주 색상)",
  "screenshots": ["/projects/<id>/screenshot-1.png", "..."],
  "platforms": ["iOS"],
  "status": "App Store | TestFlight | In Development",
  "year": 2026,
  "features": ["기능 3–5개 (영어)"],
  "techStack": ["Swift", "SwiftUI", "..."],
  "apis": ["프레임워크와 API들"],
  "links": {
    "appStore": "앱스토어 URL (있으면)",
    "github": "리포 URL (공개면)",
    "website": "웹사이트 (있으면)"
  }
}
```

규칙:
- 값이 없는 optional 필드는 키 자체를 생략 (빈 문자열 금지)
- `status`는 확실할 때만: App Store 출시 여부를 모르면 나에게 물어봐
- 코드에서 확인 불가능한 정보(출시 연도, 앱스토어 링크)는 추측하지 말고 물어봐

### 2) 에셋 복사 명령

찾은 아이콘/스크린샷의 실제 경로를 기반으로, 아래 형태의 `cp` 명령을 만들어줘:

```bash
mkdir -p ~/research/profilepage/public/projects/<id>
cp <아이콘 실제 경로> ~/research/profilepage/public/projects/<id>/icon.png
cp <스크린샷 경로> ~/research/profilepage/public/projects/<id>/screenshot-1.png
```

- 아이콘은 정사각형 원본 그대로 (모서리 라운딩은 웹사이트 CSS가 처리함)
- 스크린샷이 2MB를 넘으면 리사이즈 명령도 함께 제안해줘 (세로 1600px 이하 권장)
