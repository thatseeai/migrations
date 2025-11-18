---
title: Template을 JSX로 변환
description: Angular 템플릿 문법을 React JSX로 변환하는 완벽한 가이드
sidebar:
  order: 1
---

# Template을 JSX로 변환

Angular 템플릿 문법을 React JSX로 변환하는 방법을 다룹니다.

## 개요

**마이그레이션 난이도**: ⭐⭐⭐ (중급)
**예상 소요 시간**: 1-2시간

### 문법 매핑 테이블

| Angular Template | React JSX | 설명 |
|------------------|-----------|------|
| `{{ value }}` | `{value}` | 보간 |
| `[attr]="value"` | `attr={value}` | 속성 바인딩 |
| `(click)="fn()"` | `onClick={fn}` | 이벤트 |
| `*ngIf="cond"` | `{cond && <div>}` | 조건부 렌더링 |
| `*ngFor="let x of xs"` | `{xs.map(x => <div key={x.id}>)}` | 리스트 |
| `[class.active]="isActive"` | `className={isActive ? 'active' : ''}` | 클래스 |

(Phase 3에서 자세한 예제 추가 예정)

## 다음 단계

- [CSS 마이그레이션](./02-css-migration)
- [Material → MUI](./04-material-to-mui)
