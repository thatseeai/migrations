---
title: 디버깅 전략
description: React 애플리케이션의 효과적인 디버깅 방법
sidebar:
  order: 3
---

# 디버깅 전략

React 애플리케이션을 효과적으로 디버깅하는 방법을 다룹니다.

## 개요

**마이그레이션 난이도**: ⭐⭐ (초급-중급)
**예상 소요 시간**: 1-2시간

### 디버깅 도구

| 도구 | 용도 | 필수도 |
|------|------|--------|
| React DevTools | 컴포넌트 검사 | ✅ 필수 |
| Redux DevTools | 상태 디버깅 | ⚠️ Redux 사용 시 |
| React Query DevTools | 쿼리 디버깅 | ⚠️ React Query 사용 시 |
| Chrome DevTools | 일반 디버깅 | ✅ 필수 |

## 주요 디버깅 시나리오

1. **컴포넌트 리렌더링 추적**
2. **State 변경 추적**
3. **Props 전달 확인**
4. **Hook 디버깅**
5. **성능 병목 찾기**

(Phase 3에서 10개 이상의 디버깅 시나리오 추가 예정)

## 다음 단계

- [성능 최적화](./04-performance)
- [실전 사례](../part-05-real-world/01-incremental-migration)
