---
title: CSS 마이그레이션 전략
description: Angular 스타일을 React 스타일링 솔루션으로 마이그레이션
sidebar:
  order: 2
---

# CSS 마이그레이션 전략

Angular의 스타일 시스템을 React의 다양한 스타일링 솔루션으로 마이그레이션하는 방법을 다룹니다.

## 개요

**마이그레이션 난이도**: ⭐⭐⭐ (중급)
**예상 소요 시간**: 2-3시간

### 스타일링 옵션

| 방법 | 장점 | 단점 | 권장 |
|-----|------|------|------|
| CSS Modules | 스코프, 성능 | 동적 스타일 제한 | ✅ |
| Styled-components | 동적, 테마 | 번들 크기 | ⚠️ |
| Tailwind CSS | 빠른 개발 | 클래스명 길어짐 | ✅ |
| Emotion | 유연성 | 러닝 커브 | ⚠️ |

(Phase 3에서 자세한 예제 추가 예정)

## 다음 단계

- [애니메이션](./03-animations)
- [Material → MUI](./04-material-to-mui)
