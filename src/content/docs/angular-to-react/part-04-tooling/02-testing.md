---
title: 테스트 마이그레이션
description: Jasmine/Karma를 Jest/React Testing Library로 변환
sidebar:
  order: 2
---

# 테스트 마이그레이션

Jasmine/Karma 테스트를 Jest와 React Testing Library로 변환하는 방법을 다룹니다.

## 개요

**마이그레이션 난이도**: ⭐⭐⭐⭐ (고급)
**예상 소요 시간**: 4-6시간 (테스트 수에 따라)

### 테스팅 도구 매핑

| Angular | React | 용도 |
|---------|-------|------|
| Jasmine | Jest | 테스트 러너 |
| Karma | Vitest | 테스트 환경 |
| - | React Testing Library | 컴포넌트 테스트 |
| TestBed | `render()` | 컴포넌트 렌더링 |

## Before (Angular + Jasmine)

```typescript
describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserComponent]
    });
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
  });

  it('should display user name', () => {
    component.user = { id: 1, name: 'John' };
    fixture.detectChanges();
    const element = fixture.nativeElement;
    expect(element.textContent).toContain('John');
  });
});
```

## After (React + Jest + RTL)

```typescript
import { render, screen } from '@testing-library/react';

describe('UserComponent', () => {
  it('should display user name', () => {
    const user = { id: 1, name: 'John' };
    render(<UserComponent user={user} />);
    expect(screen.getByText('John')).toBeInTheDocument();
  });
});
```

(Phase 3에서 20개 이상의 테스트 케이스 변환 예제 추가 예정)

## 다음 단계

- [디버깅](./03-debugging)
- [성능 최적화](./04-performance)
