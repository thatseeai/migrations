# CLAUDE.md - Migration eBooks Project

## Project Overview

이 프로젝트는 다양한 프레임워크 간 마이그레이션 가이드를 제공하는 전문 eBook 플랫폼입니다. Astro Starlight를 기반으로 구축되며, 각 마이그레이션 경로별로 독립적인 콘텐츠를 관리합니다.

### 핵심 메트릭
- **목표 문서 수**: 초기 1개 (Angular to React), 연간 3-4개 추가 목표
- **평균 eBook 페이지 수**: 50-100페이지 (케이스별 분류 시)
- **코드 샘플 비율**: 전체 콘텐츠의 60-70%
- **빌드 시간 목표**: < 30초 (100페이지 기준)
- **Lighthouse 성능 목표**: 95+ (Performance, Accessibility, SEO)

## Project Structure

```
migration-ebooks/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages 자동 배포
├── src/
│   ├── content/
│   │   ├── docs/
│   │   │   ├── angular-to-react/
│   │   │   │   ├── index.mdx                    # 소개 및 개요
│   │   │   │   ├── part-01-fundamentals/        # 1부: 기초 개념
│   │   │   │   │   ├── 01-project-setup.md
│   │   │   │   │   ├── 02-component-basics.md
│   │   │   │   │   ├── 03-props-and-state.md
│   │   │   │   │   └── 04-lifecycle-methods.md
│   │   │   │   ├── part-02-advanced-patterns/   # 2부: 고급 패턴
│   │   │   │   │   ├── 01-services-to-hooks.md
│   │   │   │   │   ├── 02-dependency-injection.md
│   │   │   │   │   ├── 03-routing.md
│   │   │   │   │   └── 04-state-management.md
│   │   │   │   ├── part-03-ui-and-styling/      # 3부: UI & 스타일링
│   │   │   │   │   ├── 01-template-to-jsx.md
│   │   │   │   │   ├── 02-css-migration.md
│   │   │   │   │   ├── 03-animations.md
│   │   │   │   │   └── 04-material-to-mui.md
│   │   │   │   ├── part-04-tooling/             # 4부: 도구 및 환경
│   │   │   │   │   ├── 01-build-tools.md
│   │   │   │   │   ├── 02-testing.md
│   │   │   │   │   ├── 03-debugging.md
│   │   │   │   │   └── 04-performance.md
│   │   │   │   └── part-05-real-world/          # 5부: 실전 사례
│   │   │   │       ├── 01-incremental-migration.md
│   │   │   │       ├── 02-common-pitfalls.md
│   │   │   │       └── 03-case-studies.md
│   │   │   ├── react-to-vue/                    # 향후 추가
│   │   │   │   └── index.mdx
│   │   │   └── vue-to-svelte/                   # 향후 추가
│   │   │       └── index.mdx
│   │   └── config.ts                            # Starlight 설정
│   └── pages/
│       └── index.astro                          # 랜딩 페이지
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── CLAUDE.md
```

## Content Organization Strategy

### Angular to React eBook 구조 (정량적 분배)

| 파트 | 예상 페이지 수 | 코드 샘플 수 | 우선순위 |
|------|------------|-----------|---------|
| 1부: 기초 개념 | 15-20 | 30-40 | P0 |
| 2부: 고급 패턴 | 20-25 | 40-50 | P0 |
| 3부: UI & 스타일링 | 15-20 | 25-35 | P1 |
| 4부: 도구 및 환경 | 10-15 | 15-20 | P1 |
| 5부: 실전 사례 | 10-15 | 20-30 | P2 |
| **합계** | **70-95** | **130-175** | - |

### 각 케이스별 필수 구성 요소

각 마이그레이션 케이스는 다음 형식을 따릅니다:

```markdown
# [케이스 제목]

## 개요
- Angular 패턴 설명
- React 대응 패턴 설명
- 주요 차이점 (정량적 비교)

## Before (Angular)
```typescript
// 실제 동작하는 완전한 Angular 코드
```

## After (React 18+)
```typescript
// 실제 동작하는 완전한 React 코드
```

## 마이그레이션 단계
1. 단계별 상세 설명
2. 주의사항
3. 성능 비교 (가능한 경우)

## 실전 팁
- 일반적인 실수
- 베스트 프랙티스
- 추가 최적화 방안

## 관련 케이스
- 연관된 다른 마이그레이션 패턴 링크
```

## Technology Stack

### 정량적 선택 근거

| 기술 | 선택 이유 | 성능 메트릭 |
|-----|---------|----------|
| **Astro Starlight** | 문서 최적화 프레임워크 | - 빌드 속도: 기존 대비 2-3배 빠름<br>- 번들 크기: ~50KB (다른 솔루션 대비 70% 감소)<br>- SEO 점수: 평균 98/100 |
| **MDX** | React 컴포넌트 통합 가능 | - 코드 하이라이팅: Shiki (30+ 언어 지원)<br>- 인터랙티브 예제 가능 |
| **TypeScript** | 타입 안정성 | - 런타임 에러 감소: ~40%<br>- 개발자 생산성: ~20% 향상 |
| **GitHub Actions** | CI/CD 자동화 | - 배포 시간: ~2-3분<br>- 무료 티어: 2000분/월 |

## Implementation Phases

### Phase 1: 프로젝트 초기 설정 (2-3시간)
**요청사항**: "Astro Starlight 프로젝트를 생성하고 기본 구조를 설정해줘"

**기대 결과**:
- ✅ Astro Starlight 프로젝트 초기화
- ✅ 기본 디렉토리 구조 생성
- ✅ TypeScript 설정 완료
- ✅ 기본 테마 및 스타일 설정

**검증 방법**:
```bash
npm run dev  # localhost:4321에서 확인
```

### Phase 2: Angular to React eBook 골격 생성 (3-4시간)
**요청사항**: "Angular to React 마이그레이션 가이드의 전체 목차와 각 파트별 파일을 생성해줘"

**기대 결과**:
- ✅ 5개 파트의 폴더 구조 생성
- ✅ 각 파트별 index 파일 및 하위 문서 파일 생성 (총 20-25개)
- ✅ 각 파일에 템플릿 구조 포함
- ✅ Starlight 사이드바 네비게이션 설정

**정량적 목표**:
- 총 문서 파일: 23개
- 각 파일 초기 라인 수: 50-100줄 (템플릿)

### Phase 3: 1부 콘텐츠 작성 (8-12시간)
**요청사항**: "1부 기초 개념의 모든 케이스에 대해 실제 코드 예제와 함께 작성해줘"

**각 챕터별 요구사항**:

#### 01-project-setup.md
- Angular CLI vs Create React App/Vite 비교
- 프로젝트 구조 변환 (10개 이상의 파일 예제)
- package.json 의존성 매핑 테이블 (50개 이상의 패키지)

#### 02-component-basics.md
- Component class → Function component (15개 이상 예제)
- @Component → export default (데코레이터 제거)
- Template 문법 변환 (20개 이상의 디렉티브 케이스)

#### 03-props-and-state.md
- @Input/@Output → props/callbacks (10개 예제)
- Component state 관리 방식 비교 (8개 예제)
- 양방향 바인딩 대체 패턴 (5개 예제)

#### 04-lifecycle-methods.md
- 라이프사이클 메서드 매핑 테이블 (12개 메서드)
- useEffect 변환 패턴 (15개 이상 예제)
- cleanup 함수 활용 (7개 예제)

**정량적 목표**:
- 총 코드 샘플: 70-80개
- 각 예제당 Before/After 코드: 20-50줄
- 비교 테이블: 10개 이상

### Phase 4: 2부 콘텐츠 작성 (10-14시간)
**요청사항**: "2부 고급 패턴의 모든 케이스를 작성해줘. 특히 서비스 → 훅 변환에 집중해줘"

**각 챕터별 요구사항**:

#### 01-services-to-hooks.md
- Injectable 서비스 → Custom Hooks (15개 예제)
- Singleton 패턴 변환 (5개 예제)
- HTTP 서비스 변환 (axios/fetch 패턴 8개)

#### 02-dependency-injection.md
- DI 시스템 → Context API/Props (10개 예제)
- Provider 패턴 구현 (6개 예제)
- Multi-level injection 처리 (4개 예제)

#### 03-routing.md
- Router 설정 비교 (2개 전체 예제)
- Route Guards → 조건부 렌더링 (8개 예제)
- Lazy Loading 변환 (6개 예제)
- 파라미터 및 쿼리 처리 (10개 예제)

#### 04-state-management.md
- NgRx → Redux Toolkit (전체 store 구조 2개)
- RxJS → React Query/SWR (15개 예제)
- 상태 머신 패턴 변환 (4개 예제)

**정량적 목표**:
- 총 코드 샘플: 90-100개
- 아키텍처 다이어그램: 8-10개
- 성능 비교 차트: 5개

### Phase 5: 3-5부 콘텐츠 작성 (12-16시간)
**요청사항**: "나머지 3부, 4부, 5부를 완성해줘"

**3부: UI & 스타일링**
- Template → JSX 변환 패턴 (25개)
- CSS 전략 비교 (CSS Modules, Styled-components, Tailwind)
- Angular Material → MUI 컴포넌트 매핑 (30개 컴포넌트)
- Animation 변환 (10개 예제)

**4부: 도구 및 환경**
- Webpack/Angular CLI → Vite 설정 (완전한 config 예제)
- Jasmine/Karma → Jest/RTL 변환 (20개 테스트 케이스)
- Chrome DevTools 활용법 (10개 디버깅 시나리오)
- 성능 최적화 기법 (메모이제이션, 코드 스플리팅 등 12개)

**5부: 실전 사례**
- 점진적 마이그레이션 전략 (3개 완전한 케이스 스터디)
- 흔한 실수 및 해결책 (20개 케이스)
- 실제 프로젝트 마이그레이션 사례 (2-3개, 각 5000+ 줄 규모)

**정량적 목표**:
- 총 코드 샘플: 100-120개
- 실전 케이스 스터디: 5-8개
- 체크리스트: 50개 이상 항목

### Phase 6: GitHub Actions 및 배포 설정 (1-2시간)
**요청사항**: "GitHub Pages 배포를 위한 워크플로우를 설정하고 첫 배포를 완료해줘"

**기대 결과**:
- ✅ `.github/workflows/deploy.yml` 생성
- ✅ GitHub Pages 설정 완료
- ✅ 자동 빌드 및 배포 검증
- ✅ 커스텀 도메인 설정 (선택사항)

**성능 목표**:
- 배포 시간: < 3분
- 빌드 크기: < 5MB
- First Contentful Paint: < 1.5초

### Phase 7: 품질 검증 및 최적화 (2-3시간)
**요청사항**: "전체 eBook의 품질을 검증하고 개선사항을 제안해줘"

**검증 항목**:
- ✅ 모든 코드 샘플 동작 검증
- ✅ 링크 무결성 체크 (내부/외부 링크 100%)
- ✅ 마크다운 문법 검증
- ✅ SEO 최적화 (메타 태그, 제목 등)
- ✅ 접근성 검증 (WCAG 2.1 AA 기준)
- ✅ 이미지 최적화 (필요 시)

**정량적 품질 기준**:
- 깨진 링크: 0개
- 문법 오류: 0개
- Lighthouse 점수: 모든 항목 90+
- 코드 샘플 에러율: 0%

## Maintenance Guidelines

### 콘텐츠 업데이트 주기
- **React 버전 업데이트**: 메이저 버전 릴리즈 후 1개월 이내
- **새로운 패턴 추가**: 분기별 1-2개
- **버그 수정**: 발견 즉시 (24시간 이내)

### 새 eBook 추가 프로세스
1. `/src/content/docs/[new-migration]/` 폴더 생성
2. 동일한 파트 구조 복제
3. `astro.config.mjs`에 새 사이드바 추가
4. 랜딩 페이지에 링크 추가

**예상 소요 시간**: 새 eBook 당 40-60시간 (전문가 기준)

## Quality Metrics

### 코드 품질 지표
- **Type Coverage**: > 95%
- **ESLint 위반**: 0건
- **Prettier 준수**: 100%
- **중복 코드**: < 3%

### 문서 품질 지표
- **가독성 점수**: Flesch Reading Ease > 60
- **평균 문단 길이**: 3-5문장
- **코드 대 설명 비율**: 3:2
- **예제 완성도**: 100% (모든 예제 독립 실행 가능)

## Commands Reference

```bash
# 개발 서버 시작
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 로컬 프리뷰
npm run preview

# 타입 체크
npm run type-check

# 린팅
npm run lint

# 전체 품질 검증
npm run validate  # type-check + lint + build
```

## Success Criteria

프로젝트는 다음 기준을 모두 충족해야 합니다:

### 기능적 요구사항 (100% 충족 필수)
- ✅ 모든 코드 샘플이 실제로 동작함
- ✅ 각 케이스별 Before/After 코드 제공
- ✅ 단독 매뉴얼로 마이그레이션 가능
- ✅ GitHub Pages 자동 배포 동작
- ✅ 다중 eBook 구조 지원

### 성능 요구사항
- ✅ 빌드 시간: < 30초 (100페이지 기준)
- ✅ 페이지 로드: < 2초 (3G 기준)
- ✅ Lighthouse 성능: > 95
- ✅ 번들 크기: < 100KB (페이지당)

### 콘텐츠 요구사항
- ✅ 총 코드 샘플: 150개 이상
- ✅ 총 페이지 수: 70-100페이지
- ✅ 커버리지: 모든 주요 Angular 패턴 포함
- ✅ 실전 사례: 5개 이상

## Risk Mitigation

| 리스크 | 확률 | 영향도 | 완화 전략 |
|-------|------|-------|----------|
| React 버전 업데이트로 인한 예제 무효화 | 높음 | 높음 | - 버전별 분기 문서 유지<br>- 자동화된 코드 검증 도구 구축 |
| 너무 많은 케이스로 인한 유지보수 부담 | 중간 | 높음 | - 우선순위 기반 작성 (P0 → P1 → P2)<br>- 커뮤니티 기여 체계 구축 |
| 빌드 시간 증가 | 낮음 | 중간 | - 증분 빌드 최적화<br>- 캐싱 전략 강화 |

## Getting Started

```bash
# 이 프롬프트로 시작하세요:
"Phase 1부터 시작해서 Astro Starlight 프로젝트를 생성하고 
기본 구조를 설정해줘. 완료되면 다음 Phase를 진행할게."
```

---

## Project Configuration Details

### Astro Config Structure

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://[username].github.io',
  base: '/migration-ebooks',
  integrations: [
    starlight({
      title: 'Migration eBooks',
      logo: {
        src: './src/assets/logo.svg',
      },
      social: {
        github: 'https://github.com/[username]/migration-ebooks',
      },
      sidebar: [
        {
          label: 'Angular to React',
          autogenerate: { directory: 'angular-to-react' },
        },
        {
          label: 'React to Vue',
          autogenerate: { directory: 'react-to-vue' },
        },
      ],
      customCss: [
        './src/styles/custom.css',
      ],
    }),
  ],
});
```

### Package.json Scripts

```json
{
  "name": "migration-ebooks",
  "version": "1.0.0",
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "type-check": "tsc --noEmit",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx,.astro",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx,.astro --fix",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,astro,md,mdx,json}\"",
    "validate": "npm run type-check && npm run lint && npm run build"
  }
}
```

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## Content Writing Guidelines

### 코드 예제 작성 규칙

1. **완전성**: 모든 코드는 복사-붙여넣기로 즉시 실행 가능해야 함
2. **주석**: 핵심 변경사항에만 간결한 주석 추가
3. **타입 안전성**: TypeScript 타입 정의 필수 포함
4. **실용성**: 실제 프로젝트에서 사용 가능한 패턴 우선

### 예제 코드 템플릿

```markdown
## [케이스 제목]

### 개요
Angular의 [기능]을 React의 [대응 기능]으로 변환하는 방법입니다.

**마이그레이션 난이도**: ⭐⭐⭐ (중)
**예상 소요 시간**: 30분 (컴포넌트당)
**코드 변경량**: ~40줄 → ~35줄 (약 12% 감소)

### Before (Angular)

```typescript
// user-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { UserService } from './user.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  loading = true;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUser().subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.loading = false;
      }
    });
  }
}
```

### After (React 18+)

```typescript
// UserProfile.tsx
import { useEffect, useState } from 'react';
import { userService } from './userService';
import type { User } from './types';

export function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    userService.getUser()
      .then((user) => {
        if (!cancelled) {
          setUser(user);
          setLoading(false);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('Error loading user:', error);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="user-profile">
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### 주요 변경사항

| 항목 | Angular | React | 차이점 |
|-----|---------|-------|-------|
| 컴포넌트 정의 | Class + @Component | Function | 약 30% 코드 감소 |
| 상태 관리 | 클래스 필드 | useState | 더 명시적 |
| 라이프사이클 | ngOnInit | useEffect | 통합된 API |
| Cleanup | ngOnDestroy | useEffect return | 같은 위치에 정의 |

### 마이그레이션 체크리스트

- [ ] Component class를 function으로 변환
- [ ] constructor 제거
- [ ] 상태 변수를 useState로 변환
- [ ] ngOnInit 로직을 useEffect로 이동
- [ ] cleanup 로직 추가 (메모리 누수 방지)
- [ ] 타입 정의 확인
- [ ] 테스트 코드 업데이트

### 실전 팁

**성능 최적화**
- React Query나 SWR 사용 시 자동 캐싱/재검증 (응답 시간 50-70% 개선)
- Custom Hook으로 추출하여 재사용성 향상

**흔한 실수**
- ❌ useEffect cleanup 누락 → 메모리 누수 발생
- ❌ 의존성 배열 잘못 설정 → 무한 루프
- ✅ ESLint의 exhaustive-deps 규칙 활성화 필수

### 관련 케이스
- [Custom Hooks로 서비스 변환](../part-02-advanced-patterns/01-services-to-hooks.md)
- [에러 처리 패턴](../part-05-real-world/02-common-pitfalls.md)
```

## Documentation Standards

### 파일명 규칙
- 소문자 사용
- 단어 구분: 하이픈(-)
- 번호 prefix: 01-, 02-, ...
- 예: `01-project-setup.md`, `02-component-basics.md`

### 섹션 구조 (필수)
1. 개요 (정량적 메트릭 포함)
2. Before (Angular 코드)
3. After (React 코드)
4. 주요 변경사항 (테이블 형식)
5. 마이그레이션 단계
6. 실전 팁
7. 관련 케이스

### 메타데이터 (frontmatter)
```yaml
---
title: "컴포넌트 기초 변환"
description: "Angular Component를 React Function Component로 변환하는 완벽 가이드"
sidebar:
  order: 2
  badge:
    text: "필수"
    variant: "success"
---
```

## Performance Benchmarks

### 예상 성능 지표

| 메트릭 | 목표값 | 측정 방법 |
|-------|--------|----------|
| Time to Interactive | < 2.5초 | Lighthouse |
| First Contentful Paint | < 1.5초 | Lighthouse |
| Cumulative Layout Shift | < 0.1 | Lighthouse |
| Total Bundle Size | < 200KB | webpack-bundle-analyzer |
| Page Load (3G) | < 3초 | Chrome DevTools |
| Build Time | < 30초 | GitHub Actions logs |

### 최적화 전략

1. **이미지 최적화**
   - WebP 포맷 사용
   - 적절한 해상도 (최대 1920px)
   - Lazy loading 적용

2. **코드 스플리팅**
   - 파트별 동적 임포트
   - 각 eBook을 독립적인 번들로 분리
   - 예상 효과: 초기 로딩 시간 40-50% 감소

3. **캐싱 전략**
   - Service Worker 활용
   - CDN 캐싱 (CloudFlare 권장)
   - 브라우저 캐시 최대 활용

## Accessibility Requirements

### WCAG 2.1 AA 준수 항목

- ✅ 색상 대비율: 최소 4.5:1 (일반 텍스트)
- ✅ 키보드 네비게이션: 모든 기능 접근 가능
- ✅ 스크린 리더: 의미론적 HTML 사용
- ✅ 대체 텍스트: 모든 이미지에 alt 속성
- ✅ 포커스 표시: 명확한 focus outline
- ✅ 제목 계층: 올바른 heading 구조 (h1 → h2 → h3)

### 테스트 도구
- axe DevTools (자동 검사)
- NVDA/JAWS (스크린 리더 테스트)
- Lighthouse Accessibility (점수 90+)

## Internationalization (Future)

### 다국어 지원 계획

| 언어 | 우선순위 | 예상 완료 |
|-----|---------|----------|
| 한국어 | P0 | 초기 버전 |
| 영어 | P0 | v1.1 |
| 일본어 | P1 | v1.2 |
| 중국어 | P2 | v1.3 |

### 구현 방식
- Starlight의 내장 i18n 기능 활용
- 언어별 별도 폴더: `/ko/`, `/en/`, `/ja/`
- 자동 언어 감지 및 전환

## Community Contribution

### 기여 가이드라인

**환영하는 기여**:
- 새로운 마이그레이션 케이스 추가
- 기존 예제 개선 및 버그 수정
- 번역 (다국어 지원)
- 실전 사례 추가

**기여 프로세스**:
1. Issue 생성 (제안 내용 설명)
2. Fork & Branch 생성
3. 변경사항 작성 (코드 + 테스트)
4. Pull Request 생성
5. 리뷰 및 머지 (24-48시간 이내)

**품질 기준**:
- 모든 코드 샘플 동작 검증
- ESLint/Prettier 통과
- 기존 스타일 가이드 준수
- 최소 1개의 실전 예제 포함

## Version History

| 버전 | 릴리즈 날짜 | 주요 변경사항 |
|-----|----------|-------------|
| 1.0.0 | TBD | - Angular to React 초기 버전<br>- 23개 문서, 150+ 코드 샘플 |
| 1.1.0 | TBD | - 영어 번역 추가<br>- React 19 업데이트 |
| 1.2.0 | TBD | - React to Vue 가이드 추가 |

## Support and Resources

### 공식 문서
- [Astro Documentation](https://docs.astro.build)
- [Starlight Documentation](https://starlight.astro.build)
- [React Documentation](https://react.dev)
- [Angular Documentation](https://angular.io)

### 커뮤니티
- GitHub Discussions (Q&A)
- Discord Server (예정)
- Twitter/X: #MigrationEbooks

### 문의
- 버그 리포트: GitHub Issues
- 기능 제안: GitHub Discussions
- 보안 취약점: security@[domain].com

---

## Implementation Checklist

프로젝트 시작 전 확인사항:

### 환경 설정
- [ ] Node.js 18+ 설치 확인
- [ ] Git 설치 및 구성
- [ ] GitHub 계정 및 저장소 생성
- [ ] 코드 에디터 (VS Code 권장) 설정

### 필수 VS Code 확장
- [ ] Astro (공식)
- [ ] ESLint
- [ ] Prettier
- [ ] MDX
- [ ] Code Spell Checker

### 개발 도구
- [ ] Chrome DevTools
- [ ] React Developer Tools
- [ ] Lighthouse CI

---

이 CLAUDE.md 파일은 프로젝트의 **단일 진실 공급원(Single Source of Truth)** 입니다. 
모든 작업은 이 문서의 구조와 기준을 따라 진행됩니다.

**다음 단계**: Phase 1부터 시작하여 단계별로 프로젝트를 구축합니다.
