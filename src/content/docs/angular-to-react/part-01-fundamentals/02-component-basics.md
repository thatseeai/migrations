---
title: 컴포넌트 기초 변환
description: Angular Component를 React Function Component로 변환하는 완벽한 가이드
sidebar:
  order: 2
  badge:
    text: "필수"
    variant: "success"
---

# 컴포넌트 기초 변환

Angular Component Class를 React Function Component로 변환하는 방법을 다룹니다.

## 개요

**마이그레이션 난이도**: ⭐⭐⭐ (중급)
**예상 소요 시간**: 30분 (컴포넌트당)
**코드 변경량**: ~40줄 → ~30줄 (약 25% 감소)

### 주요 변경사항

| 항목 | Angular | React | 차이점 |
|-----|---------|-------|-------|
| 컴포넌트 정의 | Class + `@Component` | Function | 함수형 프로그래밍 |
| 템플릿 | 별도 HTML 파일 | JSX (인라인) | 단일 파일 |
| 스타일 | 별도 CSS 파일 | CSS/Styled-components | 선택 가능 |
| 상태 관리 | 클래스 필드 | `useState` Hook | 더 명시적 |

## Before (Angular)

### 기본 컴포넌트
```typescript
// user-card.component.ts
import { Component, Input } from '@angular/core';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.css']
})
export class UserCardComponent {
  @Input() user!: User;
  @Input() isActive: boolean = false;

  handleClick(): void {
    console.log('User clicked:', this.user.name);
  }

  get userInitials(): string {
    return this.user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }
}
```

```html
<!-- user-card.component.html -->
<div class="user-card" [class.active]="isActive">
  <div class="avatar">{{ userInitials }}</div>
  <div class="info">
    <h3>{{ user.name }}</h3>
    <p>{{ user.email }}</p>
    <span class="role">{{ user.role }}</span>
  </div>
  <button (click)="handleClick()">View Profile</button>
</div>
```

```css
/* user-card.component.css */
.user-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  transition: box-shadow 0.3s;
}

.user-card.active {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #6366f1;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
```

## After (React 18+)

### Function Component
```typescript
// UserCard.tsx
import { FC, useMemo } from 'react';
import './UserCard.css';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface UserCardProps {
  user: User;
  isActive?: boolean;
}

export const UserCard: FC<UserCardProps> = ({ user, isActive = false }) => {
  const handleClick = () => {
    console.log('User clicked:', user.name);
  };

  const userInitials = useMemo(() => {
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }, [user.name]);

  return (
    <div className={`user-card ${isActive ? 'active' : ''}`}>
      <div className="avatar">{userInitials}</div>
      <div className="info">
        <h3>{user.name}</h3>
        <p>{user.email}</p>
        <span className="role">{user.role}</span>
      </div>
      <button onClick={handleClick}>View Profile</button>
    </div>
  );
};
```

## 변환 패턴

### 1. 데코레이터 → Export

**Angular**
```typescript
@Component({
  selector: 'app-button',
  template: '<button>Click me</button>'
})
export class ButtonComponent {}
```

**React**
```typescript
export const Button = () => {
  return <button>Click me</button>;
};
```

### 2. Input/Output → Props

**Angular**
```typescript
@Component({...})
export class ChildComponent {
  @Input() title!: string;
  @Input() count: number = 0;
  @Output() onSave = new EventEmitter<string>();

  save() {
    this.onSave.emit('saved');
  }
}
```

**React**
```typescript
interface ChildProps {
  title: string;
  count?: number;
  onSave: (value: string) => void;
}

export const Child: FC<ChildProps> = ({
  title,
  count = 0,
  onSave
}) => {
  const save = () => {
    onSave('saved');
  };

  return (
    <div>
      <h1>{title}</h1>
      <p>Count: {count}</p>
      <button onClick={save}>Save</button>
    </div>
  );
};
```

### 3. Getter → useMemo

**Angular**
```typescript
export class ProductComponent {
  @Input() price!: number;
  @Input() quantity!: number;

  get total(): number {
    return this.price * this.quantity;
  }
}
```

**React**
```typescript
interface ProductProps {
  price: number;
  quantity: number;
}

export const Product: FC<ProductProps> = ({ price, quantity }) => {
  const total = useMemo(() => {
    return price * quantity;
  }, [price, quantity]);

  return <div>Total: ${total}</div>;
};
```

### 4. 이벤트 핸들러

**Angular**
```typescript
export class FormComponent {
  handleSubmit(event: Event): void {
    event.preventDefault();
    // 처리 로직
  }

  handleChange(value: string): void {
    console.log(value);
  }
}
```

**React**
```typescript
export const Form = () => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // 처리 로직
  };

  const handleChange = (value: string) => {
    console.log(value);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
    </form>
  );
};
```

## 마이그레이션 단계

### 1단계: 컴포넌트 구조 파악

Angular 컴포넌트의 다음 요소들을 확인:
- [ ] `@Input` 프로퍼티 목록
- [ ] `@Output` 이벤트 목록
- [ ] 메서드와 getter 목록
- [ ] 사용하는 서비스 목록

### 2단계: Props 인터페이스 정의

```typescript
// Angular Input/Output에서 추출
interface MyComponentProps {
  // @Input()
  title: string;
  count?: number;

  // @Output()
  onClick: () => void;
  onSave: (data: any) => void;
}
```

### 3단계: Function Component 변환

```typescript
export const MyComponent: FC<MyComponentProps> = ({
  title,
  count = 0,
  onClick,
  onSave
}) => {
  // 컴포넌트 로직

  return (
    // JSX
  );
};
```

### 4단계: 템플릿 변환

| Angular 문법 | React 문법 |
|-------------|-----------|
| `{{ value }}` | `{value}` |
| `[attr]="value"` | `attr={value}` |
| `(click)="handler()"` | `onClick={handler}` |
| `*ngIf="condition"` | `{condition && <div>...</div>}` |
| `*ngFor="let item of items"` | `{items.map(item => ...)}` |
| `[class.active]="isActive"` | `className={isActive ? 'active' : ''}` |

## 실전 예제

### 예제 1: 조건부 렌더링

**Angular**
```html
<div *ngIf="isLoggedIn">
  <h1>Welcome, {{ userName }}!</h1>
</div>
<div *ngIf="!isLoggedIn">
  <button (click)="login()">Login</button>
</div>
```

**React**
```tsx
{isLoggedIn ? (
  <div>
    <h1>Welcome, {userName}!</h1>
  </div>
) : (
  <div>
    <button onClick={login}>Login</button>
  </div>
)}
```

### 예제 2: 리스트 렌더링

**Angular**
```html
<ul>
  <li *ngFor="let item of items; let i = index; trackBy: trackByFn">
    {{ i + 1 }}. {{ item.name }}
  </li>
</ul>
```

**React**
```tsx
<ul>
  {items.map((item, index) => (
    <li key={item.id}>
      {index + 1}. {item.name}
    </li>
  ))}
</ul>
```

### 예제 3: 클래스 바인딩

**Angular**
```html
<div
  [class]="baseClass"
  [class.active]="isActive"
  [class.disabled]="isDisabled">
</div>
```

**React**
```tsx
import classNames from 'classnames';

<div className={classNames(
  baseClass,
  { active: isActive },
  { disabled: isDisabled }
)}>
</div>

// 또는 직접 구현
<div className={`
  ${baseClass}
  ${isActive ? 'active' : ''}
  ${isDisabled ? 'disabled' : ''}
`.trim()}>
</div>
```

## 마이그레이션 체크리스트

- [ ] Component Class를 Function으로 변환
- [ ] `@Component` 데코레이터 제거
- [ ] Props 인터페이스 정의
- [ ] `@Input` → props 파라미터
- [ ] `@Output` → props 콜백 함수
- [ ] 메서드 → 함수로 변환
- [ ] Getter → `useMemo` 또는 계산식
- [ ] HTML 템플릿 → JSX
- [ ] 이벤트 바인딩 변환
- [ ] CSS 클래스명 변환 (`[class.x]` → `className`)
- [ ] 타입 정의 확인

## 실전 팁

### 성능 최적화

**불필요한 리렌더링 방지**
```typescript
// ❌ 잘못된 방법 - 매번 새 객체 생성
<Child style={{ margin: 10 }} />

// ✅ 올바른 방법 - 메모이제이션
const style = useMemo(() => ({ margin: 10 }), []);
<Child style={style} />
```

### 컴포넌트 분리 기준

- 50줄 이상의 JSX → 하위 컴포넌트로 분리
- 반복되는 UI 패턴 → 재사용 컴포넌트
- 독립적인 로직 → Custom Hook

### 네이밍 컨벤션

| Angular | React |
|---------|-------|
| `user-card.component.ts` | `UserCard.tsx` |
| `app-button` (selector) | `Button` (컴포넌트명) |
| `AppModule` | - (불필요) |

### 흔한 실수

❌ **잘못된 방법**
```typescript
// class를 사용하면 경고 발생
<div class="container">...</div>

// onClick에 함수 실행 결과 전달
<button onClick={handleClick()}>Click</button>
```

✅ **올바른 방법**
```typescript
// className 사용
<div className="container">...</div>

// 함수 참조 전달
<button onClick={handleClick}>Click</button>

// 파라미터가 필요하면 화살표 함수
<button onClick={() => handleClick(id)}>Click</button>
```

## 다음 단계

컴포넌트 기초 변환이 완료되었다면:
1. [Props와 State 관리](./03-props-and-state)로 이동
2. 더 복잡한 상태 관리 패턴 학습
3. 컴포넌트 간 데이터 흐름 이해

## 관련 케이스

- [Props와 State 관리](./03-props-and-state)
- [라이프사이클 메서드](./04-lifecycle-methods)
- [Template → JSX 변환](../part-03-ui-and-styling/01-template-to-jsx)
