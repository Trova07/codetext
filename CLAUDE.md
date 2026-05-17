@AGENTS.md

# codetext 프로젝트

## 개요
코드를 IDE 스타일로 하이라이팅한 뒤 **PNG 이미지로 내보내는** 웹 서비스.
Word/PPT 등 문서 편집기에 붙여넣을 때 서식이 깨지는 문제를 이미지 방식으로 해결.
`codetext.io` 워터마크를 달아 직접 작성한 코드임을 증명하는 용도로도 활용.

- **라이브**: https://codetext.vercel.app
- **GitHub**: https://github.com/Trova07/codetext

---

## 기술 스택

| 역할 | 라이브러리 |
|------|-----------|
| 프레임워크 | Next.js 16 (App Router) |
| 하이라이팅 엔진 | Shiki (서버사이드 API route에서 실행) |
| 이미지 내보내기 | html-to-image (`toPng`, pixelRatio: 2) |
| 스타일 | Tailwind CSS |
| 배포 | Vercel (GitHub 연동, push 시 자동 재배포) |

---

## 파일 구조

```
app/
├── page.tsx                  # 메인 UI (클라이언트 컴포넌트)
├── globals.css               # Shiki 하이라이팅 CSS (줄 번호, 하이라이트 등)
├── layout.tsx
├── api/
│   └── highlight/
│       └── route.ts          # POST /api/highlight — Shiki 서버사이드 처리
└── components/
    └── CodePreview.tsx       # 미리보기 + 워터마크 + PNG 다운로드
```

---

## 구현된 기능

- **언어 선택**: 21종 (typescript, javascript, python, c, cpp, go, rust 등)
- **테마 선택**: 15종 (GitHub Dark, Monokai, Dracula, Tokyo Night 등)
- **창 프레임**: macOS / Windows / 없음
- **파일명 표시**: 프레임 선택 시에만 입력란 노출 (없음 선택 시 숨김)
- **줄 번호**: CSS counter 방식 (`user-select: none`으로 복사 시 제외)
- **특정 줄 하이라이트**: `1,3,5-7` 형식 입력 → Shiki transformer로 `highlighted-line` 클래스 추가
- **워터마크**: 이미지 우하단에 `codetext.io` 배지 (다크/라이트 테마 자동 대응)
- **PNG 2x 고화질 다운로드**: html-to-image, pixelRatio: 2
- **설정 기억**: 언어·테마·프레임을 localStorage에 저장, 재방문 시 자동 복원

---

## 핵심 구현 메모

### Shiki API route (`app/api/highlight/route.ts`)
- `highlightLines: number[]`를 받아 커스텀 transformer로 해당 줄 span에 `highlighted-line` 클래스 추가
- 지원하지 않는 언어는 `lang: "text"` fallback 처리

### localStorage 복원 (`app/page.tsx`)
- lazy initializer(`useState(() => ...)`) 방식은 Next.js SSR hydration 시 재실행되지 않아 동작 안 함
- **`useEffect`로 마운트 후 읽는 방식 사용** — 저장 키: `codetext-language`, `codetext-theme`, `codetext-frame`

### 줄 간격 이중 적용 문제 (`app/globals.css`)
- Shiki HTML: `<span class="line">...</span>\n<span class="line">...`
- `<pre>` 안에서 `.line`을 `display: block`으로 만들면 block 줄바꿈 + `\n` 텍스트 노드 줄바꿈이 겹쳐 간격 2배
- **해결**: `code { white-space: normal }` → `\n` 노드 무시, `.line { white-space: pre }` → 줄 내부 들여쓰기 보존

### 긴 줄에서 하이라이트 배경 잘림 문제 (`app/globals.css`)
- `.shiki`에 `overflow-x: auto`가 있어도 `code` 요소가 기본 inline이면 실제 스크롤 너비가 아닌 컨테이너 너비만큼만 배경이 칠해짐
- **해결**: `code { display: block; min-width: fit-content }` → `code`가 가장 긴 줄 기준으로 확장되어 `.highlighted-line` 배경이 스크롤 영역 끝까지 채워짐

---

## 향후 추가 가능한 기능

- 배경 패딩/그라디언트 옵션 (Carbon.now.sh 스타일)
- 커스텀 도메인 연결 (codetext.io)
- 이미지 공유 링크 (URL로 설정 포함 공유)
- 유료 플랜에서 워터마크 제거
