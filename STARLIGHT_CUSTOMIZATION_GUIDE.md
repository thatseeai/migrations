# Astro Starlight 커스터마이징 완벽 가이드

이 문서는 실제 프로젝트에서 구현한 사례를 바탕으로 Astro Starlight를 커스터마이징하는 방법을 설명합니다.

## 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [커스터마이징 전략](#커스터마이징-전략)
3. [사례 1: 커스텀 컴포넌트 만들기](#사례-1-커스텀-컴포넌트-만들기)
4. [사례 2: Starlight 빌트인 컴포넌트 오버라이드](#사례-2-starlight-빌트인-컴포넌트-오버라이드)
5. [사례 3: 전역 CSS 커스터마이징](#사례-3-전역-css-커스터마이징)
6. [사례 4: JavaScript 기능 추가](#사례-4-javascript-기능-추가)
7. [트러블슈팅](#트러블슈팅)
8. [베스트 프랙티스](#베스트-프랙티스)

---

## 프로젝트 개요

### 요구사항
- **Before/After 코드 비교**: 마이그레이션 가이드에서 코드를 좌우로 나란히 배치
- **TOC 토글 기능**: 화면 공간 확보를 위해 목차를 표시/숨김할 수 있는 버튼
- **반응형 디자인**: 모바일/태블릿/데스크톱 환경 모두 지원

### 기술 스택
- **Astro**: v5.15.9
- **Starlight**: v0.36.2
- **MDX**: 커스텀 컴포넌트 통합
- **TypeScript**: 타입 안전성

---

## 커스터마이징 전략

### Starlight 커스터마이징의 3가지 레벨

| 레벨 | 방법 | 적용 범위 | 난이도 |
|------|------|----------|--------|
| **1단계** | CSS Variables 변경 | 색상, 폰트, 간격 | ⭐ 쉬움 |
| **2단계** | 커스텀 CSS 추가 | 레이아웃, 스타일 | ⭐⭐ 보통 |
| **3단계** | 컴포넌트 오버라이드 | 구조, 기능 | ⭐⭐⭐ 어려움 |

### 우리 프로젝트의 접근 방식
```
1. CSS Variables (기본 색상, 너비)
   ↓
2. 커스텀 CSS (TOC 토글 스타일, 마진 조정)
   ↓
3. 새 컴포넌트 추가 (SideBySide.astro)
   ↓
4. 빌트인 컴포넌트 오버라이드 (Head.astro)
```

---

## 사례 1: 커스텀 컴포넌트 만들기

### 목표
Before/After 코드를 좌우로 나란히 배치하는 `SideBySide` 컴포넌트 제작

### 1.1 파일 구조

```
src/
├── components/
│   └── SideBySide.astro    # 새 컴포넌트
├── content/
│   └── docs/
│       └── example.mdx     # MDX 파일에서 사용
└── styles/
    └── custom.css          # 전역 스타일
```

### 1.2 컴포넌트 구현

**파일**: `src/components/SideBySide.astro`

```astro
---
// Props 인터페이스 정의
interface Props {
  leftTitle?: string;
  rightTitle?: string;
}

const {
  leftTitle = "Before (Angular)",
  rightTitle = "After (React 18+)"
} = Astro.props;
---

<div class="side-by-side-wrapper">
  <div class="side-by-side-container">
    <!-- 왼쪽 패널 -->
    <div class="side-by-side-panel left-panel">
      <h3 class="panel-title">{leftTitle}</h3>
      <div class="panel-content">
        <slot name="left" />
      </div>
    </div>

    <!-- 오른쪽 패널 -->
    <div class="side-by-side-panel right-panel">
      <h3 class="panel-title">{rightTitle}</h3>
      <div class="panel-content">
        <slot name="right" />
      </div>
    </div>
  </div>
</div>

<style>
  /* Grid 레이아웃으로 좌우 배치 */
  .side-by-side-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    align-items: stretch;
  }

  /* 패널을 Grid로 구성하여 제목과 콘텐츠 정렬 */
  .side-by-side-panel {
    display: grid;
    grid-template-rows: auto 1fr;  /* 제목(auto) + 콘텐츠(1fr) */
    height: 100%;
    margin: 0 !important;
  }

  /* 제목 스타일 */
  .panel-title {
    margin: 0 !important;
    padding: 0.5rem 0.75rem;
    background: var(--sl-color-accent-low);
    border-radius: 0.5rem 0.5rem 0 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--sl-color-white);
  }

  /* 콘텐츠 영역 */
  .panel-content {
    display: flex;
    flex-direction: column;
    padding-top: 0.75rem;
    background: var(--sl-color-bg-inline);
    border-radius: 0 0 0.5rem 0.5rem;
    margin: 0 !important;
  }

  /* 반응형: 좁은 화면에서는 세로 배치 */
  @media (max-width: 1200px) {
    .side-by-side-container {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }
</style>
```

### 1.3 MDX에서 사용하기

**파일**: `src/content/docs/example.mdx`

```mdx
---
title: 컴포넌트 비교 예제
---

import SideBySide from '../../components/SideBySide.astro';

## 기본 사용법

<SideBySide>
  <div slot="left">

### Angular 코드

```typescript
@Component({
  selector: 'app-button',
  template: '<button>Click</button>'
})
export class ButtonComponent {}
```

  </div>
  <div slot="right">

### React 코드

```typescript
export const Button = () => {
  return <button>Click</button>;
};
```

  </div>
</SideBySide>

## 커스텀 제목 사용

<SideBySide leftTitle="이전 코드" rightTitle="새 코드">
  <div slot="left">
    <!-- 왼쪽 콘텐츠 -->
  </div>
  <div slot="right">
    <!-- 오른쪽 콘텐츠 -->
  </div>
</SideBySide>
```

### 1.4 핵심 포인트

#### ✅ Grid 레이아웃 사용
```css
/* Flex 대신 Grid 사용 - 더 정확한 정렬 */
.side-by-side-panel {
  display: grid;
  grid-template-rows: auto 1fr;
}
```

**이유**: Flex는 콘텐츠 크기에 따라 높이가 달라질 수 있지만, Grid는 명시적으로 행을 정의하여 정확한 정렬 보장

#### ✅ Slot 패턴 활용
```astro
<slot name="left" />
<slot name="right" />
```

**장점**: MDX에서 마크다운과 코드 블록을 자유롭게 작성 가능

#### ✅ 반응형 디자인
```css
@media (max-width: 1200px) {
  .side-by-side-container {
    grid-template-columns: 1fr;  /* 세로 배치 */
  }
}
```

---

## 사례 2: Starlight 빌트인 컴포넌트 오버라이드

### 목표
`Head` 컴포넌트를 오버라이드하여 TOC 토글 JavaScript 추가

### 2.1 컴포넌트 오버라이드 설정

**파일**: `astro.config.mjs`

```javascript
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'My Docs',
      components: {
        // Starlight의 기본 Head 컴포넌트를 오버라이드
        Head: './src/components/Head.astro',
      },
    }),
  ],
});
```

### 2.2 Head 컴포넌트 구현

**파일**: `src/components/Head.astro`

```astro
---
import type { Props } from '@astrojs/starlight/props';
import Default from '@astrojs/starlight/components/Head.astro';
---

<!-- 기본 Head 컴포넌트 렌더링 -->
<Default {...Astro.props}><slot /></Default>

<!-- 추가 스크립트 -->
<script is:inline>
  // TOC 토글 기능
  function initTocToggle() {
    // 이미 버튼이 있으면 리턴
    if (document.getElementById('toc-toggle')) {
      return;
    }

    // 토글 버튼 생성
    const toggleButton = document.createElement('button');
    toggleButton.id = 'toc-toggle';
    toggleButton.className = 'toc-toggle-button';
    toggleButton.innerHTML = '<span>📋</span><span>목차</span>';

    document.body.appendChild(toggleButton);

    // 로컬 스토리지에서 상태 복원
    const tocHidden = localStorage.getItem('toc-hidden') === 'true';
    if (tocHidden) {
      document.body.classList.add('toc-hidden');
    }

    // 클릭 이벤트
    toggleButton.addEventListener('click', () => {
      const isHidden = document.body.classList.toggle('toc-hidden');
      localStorage.setItem('toc-hidden', isHidden.toString());
    });

    // 키보드 단축키 (Ctrl + \)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        toggleButton.click();
      }
    });
  }

  // 페이지 로드 시 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTocToggle);
  } else {
    initTocToggle();
  }

  // Astro View Transitions 지원
  document.addEventListener('astro:page-load', initTocToggle);
</script>

<style is:inline>
  .toc-toggle-button {
    position: fixed;
    top: 5rem;
    right: 1rem;
    z-index: 100;
    padding: 0.5rem 0.75rem;
    background: var(--sl-color-accent);
    color: white;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
  }
</style>
```

### 2.3 핵심 포인트

#### ✅ 기본 컴포넌트 확장
```astro
import Default from '@astrojs/starlight/components/Head.astro';

<Default {...Astro.props}><slot /></Default>
```

**중요**: 기본 기능을 유지하면서 추가 기능만 삽입

#### ✅ is:inline 디렉티브
```astro
<script is:inline>
  // 코드가 번들링되지 않고 그대로 삽입됨
</script>
```

**이유**: 페이지 로드 즉시 실행되어야 하는 초기화 코드에 사용

#### ✅ View Transitions 지원
```javascript
document.addEventListener('astro:page-load', initTocToggle);
```

**필수**: Astro의 View Transitions 사용 시 페이지 전환마다 재초기화

#### ✅ 로컬 스토리지 활용
```javascript
localStorage.setItem('toc-hidden', isHidden.toString());
const tocHidden = localStorage.getItem('toc-hidden') === 'true';
```

**장점**: 사용자 설정을 브라우저에 저장하여 다음 방문 시에도 유지

---

## 사례 3: 전역 CSS 커스터마이징

### 목표
Starlight의 기본 스타일을 덮어쓰고 커스텀 기능 추가

### 3.1 CSS 파일 설정

**파일**: `astro.config.mjs`

```javascript
export default defineConfig({
  integrations: [
    starlight({
      customCss: [
        './src/styles/custom.css',  // 커스텀 CSS 추가
      ],
    }),
  ],
});
```

### 3.2 CSS Variables 커스터마이징

**파일**: `src/styles/custom.css`

```css
/* CSS Variables로 기본 스타일 변경 */
:root {
  /* 브랜드 색상 */
  --sl-color-accent-low: #1e1b4b;
  --sl-color-accent: #6366f1;
  --sl-color-accent-high: #a5b4fc;

  /* 레이아웃 */
  --sl-content-width: 75rem;      /* 기본 50rem → 75rem */
  --sl-sidebar-width: 18rem;
}

/* Dark 모드 */
:root[data-theme='dark'] {
  --sl-color-accent-low: #c7d2fe;
  --sl-color-accent: #818cf8;
  --sl-color-accent-high: #4f46e5;
}
```

### 3.3 Starlight 스타일 덮어쓰기

#### ⚠️ 문제: Starlight의 기본 마진이 간섭

```css
/* Starlight의 기본 스타일 예시 */
.sl-markdown-content h3 {
  margin-top: 1rem;  /* 이 값이 커스텀 컴포넌트를 망침 */
}
```

#### ✅ 해결: !important로 강제 덮어쓰기

```css
/* SideBySide 컴포넌트 내부의 마진 제거 */
.side-by-side-wrapper .side-by-side-panel {
  margin: 0 !important;
}

.side-by-side-wrapper .panel-content > div {
  margin: 0 !important;
}

/* 첫 번째 제목의 상단 마진 제거 */
.side-by-side-wrapper .panel-content > div > *:first-child {
  margin-top: 0 !important;
}

/* Starlight의 마크다운 스타일 덮어쓰기 */
.sl-markdown-content .side-by-side-wrapper .panel-content h3:first-child {
  margin-top: 0 !important;
}
```

### 3.4 TOC 토글 스타일

```css
/* TOC 토글 버튼 */
.toc-toggle-button {
  position: fixed;
  top: 5rem;
  right: 1rem;
  z-index: 100;
  padding: 0.5rem 0.75rem;
  background: var(--sl-color-accent);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toc-toggle-button:hover {
  background: var(--sl-color-accent-high);
  transform: translateY(-1px);
}

/* TOC가 숨겨질 때 */
body.toc-hidden .right-sidebar-container {
  display: none !important;
}

/* 콘텐츠 영역 확장 */
body.toc-hidden .main-frame {
  padding-right: 1rem !important;
}
```

### 3.5 핵심 포인트

#### ✅ CSS Specificity (명시도) 이해

```css
/* 약함 */
.panel-content { margin: 0; }

/* 중간 */
.side-by-side-wrapper .panel-content { margin: 0; }

/* 강함 */
.sl-markdown-content .side-by-side-wrapper .panel-content { margin: 0; }

/* 최강 */
.sl-markdown-content .side-by-side-wrapper .panel-content { margin: 0 !important; }
```

**원칙**: Starlight의 스타일을 덮어쓰려면 더 높은 명시도가 필요

#### ✅ !important 사용 기준

| 상황 | !important 사용 |
|------|----------------|
| Starlight 기본 스타일과 충돌 | ✅ 사용 |
| 자체 컴포넌트 내부 | ❌ 사용 안 함 |
| 명시도로 해결 가능 | ❌ 사용 안 함 |

#### ✅ CSS Variables 우선 활용

```css
/* 나쁜 예 - 직접 색상 지정 */
.my-component {
  background: #6366f1;
}

/* 좋은 예 - CSS Variable 사용 */
.my-component {
  background: var(--sl-color-accent);
}
```

**장점**: Dark 모드 자동 지원, 일관된 디자인

---

## 사례 4: JavaScript 기능 추가

### 4.1 상태 관리 (State Management)

```javascript
// 토글 상태를 localStorage에 저장
function toggleToc() {
  const isHidden = document.body.classList.toggle('toc-hidden');
  localStorage.setItem('toc-hidden', isHidden.toString());
  return isHidden;
}

// 페이지 로드 시 상태 복원
function restoreTocState() {
  const tocHidden = localStorage.getItem('toc-hidden') === 'true';
  if (tocHidden) {
    document.body.classList.add('toc-hidden');
  }
}
```

### 4.2 이벤트 리스너

```javascript
// 클릭 이벤트
toggleButton.addEventListener('click', toggleToc);

// 키보드 단축키
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
    e.preventDefault();
    toggleToc();
  }
});
```

### 4.3 중복 실행 방지

```javascript
function initTocToggle() {
  // 이미 초기화되었는지 확인
  if (document.getElementById('toc-toggle')) {
    return;  // 중복 실행 방지
  }

  // 초기화 로직...
}
```

### 4.4 Astro View Transitions 대응

```javascript
// 일반 페이지 로드
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTocToggle);
} else {
  initTocToggle();
}

// View Transitions (SPA처럼 작동)
document.addEventListener('astro:page-load', initTocToggle);
```

---

## 트러블슈팅

### 문제 1: 컴포넌트 import 경로 오류

#### ❌ 증상
```
Error: Could not resolve '../../../components/SideBySide.astro'
```

#### ✅ 해결
```mdx
<!-- 상대 경로를 정확히 계산 -->
<!-- part-01-fundamentals/example.mdx에서 -->
import SideBySide from '../../../../components/SideBySide.astro';

<!-- 또는 절대 경로 사용 (권장) -->
<!-- tsconfig.json에 paths 설정 필요 -->
import SideBySide from '@/components/SideBySide.astro';
```

**tsconfig.json 설정**:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### 문제 2: CSS 스타일이 적용되지 않음

#### ❌ 증상
커스텀 CSS를 작성했지만 화면에 반영되지 않음

#### ✅ 해결 순서

1. **CSS 명시도 확인**
```css
/* 약함 - 적용 안 됨 */
.panel { margin: 0; }

/* 강함 - 적용됨 */
.sl-markdown-content .side-by-side-wrapper .panel { margin: 0 !important; }
```

2. **브라우저 개발자 도구로 확인**
- F12 → Elements → Computed Styles
- 어떤 스타일이 최종 적용되었는지 확인
- 덮어쓰인 스타일은 취소선으로 표시됨

3. **캐시 삭제**
```bash
# 개발 서버 재시작
npm run dev

# 또는 브라우저 강력 새로고침
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### 문제 3: 좌우 패널 정렬 안 맞음

#### ❌ 증상
Before/After 패널의 시작 높이가 다름

#### ✅ 원인 분석
```css
/* Starlight의 기본 스타일이 간섭 */
.sl-markdown-content h3 {
  margin-top: 1rem;  /* ← 이게 문제 */
}
```

#### ✅ 해결
```css
/* 1. Grid 레이아웃 사용 */
.side-by-side-panel {
  display: grid;
  grid-template-rows: auto 1fr;  /* 명시적 행 정의 */
}

/* 2. 모든 마진 강제 제거 */
.side-by-side-wrapper .panel-content > div > *:first-child {
  margin-top: 0 !important;
}

/* 3. Starlight 스타일 덮어쓰기 */
.sl-markdown-content .side-by-side-wrapper h3 {
  margin-top: 0 !important;
}
```

### 문제 4: MDX에서 코드 블록이 제대로 렌더링되지 않음

#### ❌ 증상
```mdx
<SideBySide>
  <div slot="left">
```typescript
// 코드가 일반 텍스트로 표시됨
```
  </div>
</SideBySide>
```

#### ✅ 해결
```mdx
<!-- 코드 블록과 div 사이에 빈 줄 필수 -->
<SideBySide>
  <div slot="left">

```typescript
// 이제 제대로 렌더링됨
```

  </div>
</SideBySide>
```

**규칙**: MDX에서 마크다운 구문(코드 블록, 제목 등)은 앞뒤로 빈 줄이 있어야 함

### 문제 5: JavaScript가 View Transitions에서 작동 안 함

#### ❌ 증상
페이지 전환 후 JavaScript 기능이 사라짐

#### ✅ 해결
```javascript
// DOMContentLoaded만으로는 부족
document.addEventListener('DOMContentLoaded', init);

// Astro View Transitions 이벤트도 추가
document.addEventListener('astro:page-load', init);

// 또는 두 경우 모두 처리
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
document.addEventListener('astro:page-load', init);
```

---

## 베스트 프랙티스

### 1. 컴포넌트 설계

#### ✅ Props 타입 정의
```astro
---
interface Props {
  leftTitle?: string;     // Optional
  rightTitle?: string;
  variant?: 'default' | 'compact';  // Union type
}

// 기본값 설정
const {
  leftTitle = "Before",
  rightTitle = "After",
  variant = "default"
} = Astro.props;
---
```

#### ✅ Slot 이름 명확히
```astro
<!-- 나쁜 예 -->
<slot />
<slot name="content" />

<!-- 좋은 예 -->
<slot name="left" />
<slot name="right" />
<slot name="header" />
```

#### ✅ 스타일 스코핑
```astro
<style>
  /* 컴포넌트 내부 스타일은 자동으로 스코핑됨 */
  .panel {
    padding: 1rem;
  }

  /* 전역 스타일은 :global() 사용 */
  :global(.side-by-side-wrapper) {
    margin: 2rem 0;
  }
</style>
```

### 2. CSS 작성

#### ✅ CSS Variables 우선 사용
```css
/* 나쁜 예 */
.my-button {
  background: #6366f1;
  color: white;
}

/* 좋은 예 */
.my-button {
  background: var(--sl-color-accent);
  color: var(--sl-color-white);
}
```

#### ✅ 명시도 최소화
```css
/* 나쁜 예 */
.wrapper .container .content .item { }

/* 좋은 예 */
.content-item { }
```

#### ✅ !important 최소화
```css
/* !important는 마지막 수단 */
/* Starlight 스타일을 덮어쓸 때만 사용 */
.sl-markdown-content .my-component {
  margin: 0 !important;  /* 필요할 때만 */
}
```

### 3. JavaScript 작성

#### ✅ 중복 실행 방지
```javascript
function init() {
  // Guard clause
  if (document.getElementById('my-button')) {
    return;
  }

  // 초기화 로직...
}
```

#### ✅ 메모리 누수 방지
```javascript
let controller = new AbortController();

function init() {
  // 이전 이벤트 리스너 제거
  controller.abort();
  controller = new AbortController();

  // 새 이벤트 리스너 등록
  button.addEventListener('click', handler, {
    signal: controller.signal
  });
}
```

#### ✅ 에러 처리
```javascript
function toggleToc() {
  try {
    const isHidden = document.body.classList.toggle('toc-hidden');
    localStorage.setItem('toc-hidden', isHidden.toString());
  } catch (error) {
    console.error('Failed to toggle TOC:', error);
    // Fallback 동작
  }
}
```

### 4. 파일 구조

```
src/
├── components/
│   ├── SideBySide.astro        # 커스텀 컴포넌트
│   ├── Head.astro               # 오버라이드 컴포넌트
│   └── TocToggle.astro          # (옵션) 분리된 컴포넌트
├── content/
│   └── docs/
│       └── example.mdx
├── styles/
│   ├── custom.css               # 전역 스타일
│   └── variables.css            # (옵션) CSS Variables만
└── scripts/
    └── toc-toggle.js            # (옵션) 분리된 스크립트
```

### 5. 문서화

#### ✅ 컴포넌트 사용 가이드 작성
```markdown
# SideBySide 컴포넌트

## Props
- `leftTitle` (optional): 왼쪽 패널 제목
- `rightTitle` (optional): 오른쪽 패널 제목

## 사용 예시
\`\`\`mdx
<SideBySide>
  <div slot="left">...</div>
  <div slot="right">...</div>
</SideBySide>
\`\`\`
```

#### ✅ 코드 주석
```astro
---
// Props 인터페이스 정의
interface Props {
  leftTitle?: string;  // 왼쪽 패널 제목 (기본값: "Before")
  rightTitle?: string; // 오른쪽 패널 제목 (기본값: "After")
}
---
```

---

## 성능 최적화

### 1. CSS 최적화

```css
/* 나쁜 예 - 과도한 선택자 */
.wrapper .container .content .item .title .text {
  color: red;
}

/* 좋은 예 - 간결한 선택자 */
.item-title-text {
  color: red;
}
```

### 2. JavaScript 최적화

```javascript
// 나쁜 예 - 매번 DOM 조회
button.addEventListener('click', () => {
  const element = document.querySelector('.my-element');
  element.classList.toggle('active');
});

// 좋은 예 - 한 번만 조회
const element = document.querySelector('.my-element');
button.addEventListener('click', () => {
  element.classList.toggle('active');
});
```

### 3. 이미지 최적화

```astro
---
import { Image } from 'astro:assets';
import myImage from '../assets/image.png';
---

<!-- Astro의 이미지 최적화 사용 -->
<Image src={myImage} alt="Description" width={800} height={600} />
```

---

## 체크리스트

### 커스터마이징 전

- [ ] Starlight 공식 문서 확인
- [ ] 기존 컴포넌트로 해결 가능한지 검토
- [ ] CSS Variables로 해결 가능한지 확인
- [ ] 필요한 기능 명확히 정의

### 개발 중

- [ ] 타입 정의 작성 (TypeScript)
- [ ] 반응형 디자인 고려
- [ ] Dark 모드 지원 확인
- [ ] 브라우저 호환성 테스트
- [ ] 접근성(a11y) 검토

### 개발 후

- [ ] 빌드 성공 확인 (`npm run build`)
- [ ] 프로덕션 프리뷰 테스트 (`npm run preview`)
- [ ] 사용 가이드 문서 작성
- [ ] 코드 주석 추가
- [ ] Git 커밋 및 푸시

---

## 참고 자료

### 공식 문서
- [Astro 문서](https://docs.astro.build)
- [Starlight 문서](https://starlight.astro.build)
- [Starlight 커스터마이징](https://starlight.astro.build/guides/customization/)
- [MDX 문법](https://mdxjs.com/)

### 관련 파일
- `SIDE_BY_SIDE_USAGE.md`: SideBySide 컴포넌트 상세 가이드
- `src/components/SideBySide.astro`: 컴포넌트 소스
- `src/components/Head.astro`: Head 오버라이드 소스
- `src/styles/custom.css`: 전역 스타일

### 유용한 도구
- [Astro DevTools](https://github.com/withastro/astro-devtools)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [CSS Specificity Calculator](https://specificity.keegan.st/)

---

## 결론

Astro Starlight 커스터마이징은 다음 순서로 접근하세요:

1. **CSS Variables 변경** (가장 간단)
   - 색상, 폰트, 간격 조정

2. **커스텀 CSS 추가** (보통)
   - 레이아웃, 스타일 덮어쓰기

3. **새 컴포넌트 제작** (고급)
   - 완전히 새로운 기능 추가

4. **빌트인 컴포넌트 오버라이드** (최고급)
   - Starlight 핵심 기능 수정

각 단계마다 충분히 테스트하고, 문제가 생기면 브라우저 개발자 도구로 디버깅하세요.

**핵심 원칙**:
- 최소한의 변경으로 최대 효과
- Starlight의 기본 기능 존중
- 유지보수 가능한 코드 작성

---

이 가이드는 실제 프로덕션 환경에서 검증된 방법입니다. 문제가 발생하면 GitHub Issues에 제보해주세요!
