# SideBySide 컴포넌트 사용 가이드

## 개요

Before/After 코드 블록을 좌우로 배치하여 비교를 쉽게 하기 위한 커스텀 컴포넌트입니다.

## 주요 기능

### 1. **SideBySide 코드 비교**
- Before/After 코드를 좌우로 나란히 배치
- 반응형 디자인 (1200px 이하에서는 세로 배치로 자동 전환)
- 커스터마이징 가능한 제목

### 2. **TOC (목차) 토글 기능**
- 우측 상단의 "📋 목차" 버튼으로 목차 표시/숨김 가능
- 키보드 단축키: `Ctrl + \` (Windows/Linux) 또는 `Cmd + \` (Mac)
- 설정은 로컬 스토리지에 저장되어 페이지 이동 시에도 유지됨

### 3. **확장된 콘텐츠 너비**
- 기존 `50rem`에서 `75rem`으로 확장하여 더 넓은 코드 비교 공간 제공
- TOC를 숨기면 더 넓은 화면 활용 가능

## SideBySide 컴포넌트 사용법

### 기본 사용법

마크다운 파일을 `.mdx` 확장자로 변경하고 다음과 같이 사용합니다:

```mdx
---
title: 컴포넌트 기초 변환
---

import SideBySide from '../../../../components/SideBySide.astro';

## 기본 컴포넌트 비교

<SideBySide>
  <div slot="left">

### Angular 코드

```typescript
@Component({
  selector: 'app-button',
  template: '<button>Click me</button>'
})
export class ButtonComponent {}
```

  </div>
  <div slot="right">

### React 코드

```typescript
export const Button = () => {
  return <button>Click me</button>;
};
```

  </div>
</SideBySide>
```

### 커스텀 제목 사용

```mdx
<SideBySide leftTitle="Before (Angular 15)" rightTitle="After (React 19)">
  <div slot="left">

    <!-- 왼쪽 콘텐츠 -->

  </div>
  <div slot="right">

    <!-- 오른쪽 콘텐츠 -->

  </div>
</SideBySide>
```

### 기본 제목

제목을 지정하지 않으면 기본값이 사용됩니다:
- 왼쪽: "Before (Angular)"
- 오른쪽: "After (React 18+)"

## 파일 변환 가이드

### 1단계: 파일 확장자 변경

```bash
mv src/content/docs/your-file.md src/content/docs/your-file.mdx
```

### 2단계: Import 추가

파일 상단의 frontmatter 아래에 import 구문을 추가합니다:

```mdx
---
title: 제목
---

import SideBySide from '../../../../components/SideBySide.astro';
```

**중요**: Import 경로는 파일의 위치에 따라 조정해야 합니다.
- `part-01-fundamentals/` 폴더: `../../../../components/SideBySide.astro`
- `part-02-advanced-patterns/` 폴더: `../../../../components/SideBySide.astro`
- 기타: 상대 경로 계산 필요

### 3단계: Before/After 섹션 변환

기존:
```markdown
## Before (Angular)
```typescript
// 코드
```

## After (React)
```typescript
// 코드
```
```

변환 후:
```mdx
<SideBySide>
  <div slot="left">

```typescript
// Angular 코드
```

  </div>
  <div slot="right">

```typescript
// React 코드
```

  </div>
</SideBySide>
```

## 스타일 커스터마이징

### CSS 변수

`src/styles/custom.css`에서 다음 변수를 조정할 수 있습니다:

```css
:root {
  --sl-content-width: 75rem;  /* 콘텐츠 최대 너비 */
  --sl-color-accent: #6366f1; /* TOC 버튼 색상 */
}
```

### 반응형 중단점

SideBySide 컴포넌트의 반응형 중단점은 `1200px`입니다:
- `>= 1200px`: 좌우 배치
- `< 1200px`: 세로 배치

변경하려면 `src/components/SideBySide.astro`의 미디어 쿼리를 수정하세요.

## TOC 토글 기능

### 사용 방법

1. **버튼 클릭**: 우측 상단의 "📋 목차" 버튼 클릭
2. **키보드 단축키**: `Ctrl + \` (Windows/Linux) 또는 `Cmd + \` (Mac)

### 동작 원리

- 상태는 `localStorage`에 저장되어 브라우저를 닫아도 유지됨
- `toc-hidden` 클래스를 `<body>`에 토글
- CSS의 `display: none`으로 TOC를 숨김
- 콘텐츠 영역이 자동으로 확장됨

### 커스터마이징

버튼 위치나 스타일을 변경하려면 `src/styles/custom.css`의 `.toc-toggle-button` 스타일을 수정하세요:

```css
.toc-toggle-button {
  position: fixed;
  top: 5rem;      /* 상단 위치 */
  right: 1rem;    /* 우측 위치 */
  /* 기타 스타일 */
}
```

## 예제 파일

변환 예제는 다음 파일을 참고하세요:
- `src/content/docs/angular-to-react/part-01-fundamentals/02-component-basics.mdx`

## 트러블슈팅

### Import 경로 오류

```
Error: Could not resolve '../../../components/SideBySide.astro'
```

**해결책**: Import 경로를 파일 위치에 맞게 조정하세요. `../`의 개수를 확인하세요.

### 슬롯 콘텐츠가 표시되지 않음

```mdx
<SideBySide>
  <div slot="left">
    내용
  </div>
</SideBySide>
```

**해결책**: `slot="left"`와 `slot="right"` 속성이 정확히 입력되었는지 확인하세요.

### 코드 블록 스타일이 깨짐

**해결책**: 코드 블록과 슬롯 `<div>` 사이에 빈 줄을 추가하세요:

```mdx
<div slot="left">

```typescript  <!-- 이 위에 빈 줄 필수 -->
// 코드
```

</div>  <!-- 이 아래에 빈 줄 필수 -->
```

## 모든 페이지에 일괄 적용

모든 마크다운 파일을 변환하려면:

```bash
# 1. 모든 .md 파일을 .mdx로 변환
find src/content/docs/angular-to-react -name "*.md" -exec bash -c 'mv "$0" "${0%.md}.mdx"' {} \;

# 2. 각 파일에 import 추가 (수동 작업 필요)
# 3. Before/After 섹션을 SideBySide 컴포넌트로 감싸기 (수동 작업 필요)
```

**참고**: 대량 변환은 스크립트를 작성하여 자동화할 수 있지만, 각 파일의 구조가 다를 수 있으므로 주의가 필요합니다.

## 성능 고려사항

- **빌드 시간**: SideBySide 컴포넌트 사용으로 인한 빌드 시간 증가는 미미함 (< 5%)
- **번들 크기**: 추가 CSS는 약 2KB (gzip 압축 시)
- **런타임 성능**: JavaScript는 TOC 토글 기능만 실행하므로 영향 없음

## 업그레이드 가이드

### v1.0에서 v2.0으로 (SideBySide 추가)

1. 새로운 파일 확인:
   - `src/components/SideBySide.astro`
   - `src/components/Head.astro`
   - `src/components/TocToggle.astro` (사용되지 않지만 참고용)

2. `astro.config.mjs` 업데이트:
   ```javascript
   components: {
     Head: './src/components/Head.astro',
   }
   ```

3. `src/styles/custom.css` 업데이트 (기존 파일 백업 권장)

4. 점진적 마이그레이션:
   - 한 번에 모든 파일을 변환하지 말고
   - 중요한 페이지부터 하나씩 변환
   - 각 페이지를 빌드하고 확인

## 참고 자료

- [Astro 문서](https://docs.astro.build)
- [Starlight 문서](https://starlight.astro.build)
- [MDX 문법](https://mdxjs.com/)

## 지원

문제가 발생하면 GitHub Issues에 제보해주세요.
