---
title: Props와 State 관리
description: '@Input/@Output을 Props로, 컴포넌트 상태를 useState로 변환하는 방법'
sidebar:
  order: 3
  badge:
    text: "필수"
    variant: "success"
---

# Props와 State 관리

Angular의 `@Input`/`@Output`과 클래스 필드를 React의 Props와 `useState`로 변환하는 방법을 다룹니다.

## 개요

**마이그레이션 난이도**: ⭐⭐⭐ (중급)
**예상 소요 시간**: 20-30분 (컴포넌트당)
**핵심 개념**: Props (불변), State (가변)

### 주요 변경사항

| 항목 | Angular | React |
|-----|---------|-------|
| 부모→자식 데이터 | `@Input()` | Props |
| 자식→부모 이벤트 | `@Output()` + EventEmitter | Props (콜백 함수) |
| 로컬 상태 | 클래스 필드 | `useState` |
| 양방향 바인딩 | `[(ngModel)]` | 제어 컴포넌트 패턴 |

## Before (Angular)

### @Input / @Output
```typescript
// parent.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-parent',
  template: `
    <app-child
      [title]="pageTitle"
      [count]="counter"
      (onIncrement)="handleIncrement($event)"
      (onReset)="handleReset()">
    </app-child>
  `
})
export class ParentComponent {
  pageTitle = 'Counter App';
  counter = 0;

  handleIncrement(value: number): void {
    this.counter += value;
  }

  handleReset(): void {
    this.counter = 0;
  }
}
```

```typescript
// child.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-child',
  template: `
    <div>
      <h2>{{ title }}</h2>
      <p>Count: {{ count }}</p>
      <button (click)="increment()">+1</button>
      <button (click)="incrementBy(5)">+5</button>
      <button (click)="reset()">Reset</button>
    </div>
  `
})
export class ChildComponent {
  @Input() title!: string;
  @Input() count: number = 0;
  @Output() onIncrement = new EventEmitter<number>();
  @Output() onReset = new EventEmitter<void>();

  increment(): void {
    this.onIncrement.emit(1);
  }

  incrementBy(value: number): void {
    this.onIncrement.emit(value);
  }

  reset(): void {
    this.onReset.emit();
  }
}
```

## After (React 18+)

### Props & Callbacks
```typescript
// Parent.tsx
import { FC, useState } from 'react';
import { Child } from './Child';

export const Parent: FC = () => {
  const [counter, setCounter] = useState(0);
  const pageTitle = 'Counter App';

  const handleIncrement = (value: number) => {
    setCounter(prev => prev + value);
  };

  const handleReset = () => {
    setCounter(0);
  };

  return (
    <Child
      title={pageTitle}
      count={counter}
      onIncrement={handleIncrement}
      onReset={handleReset}
    />
  );
};
```

```typescript
// Child.tsx
import { FC } from 'react';

interface ChildProps {
  title: string;
  count: number;
  onIncrement: (value: number) => void;
  onReset: () => void;
}

export const Child: FC<ChildProps> = ({
  title,
  count,
  onIncrement,
  onReset
}) => {
  return (
    <div>
      <h2>{title}</h2>
      <p>Count: {count}</p>
      <button onClick={() => onIncrement(1)}>+1</button>
      <button onClick={() => onIncrement(5)}>+5</button>
      <button onClick={onReset}>Reset</button>
    </div>
  );
};
```

## 변환 패턴

### 1. Input Props (단순 값)

**Angular**
```typescript
@Input() name!: string;
@Input() age: number = 0;
@Input() isActive: boolean = false;
@Input() user?: User;
```

**React**
```typescript
interface ComponentProps {
  name: string;
  age?: number;
  isActive?: boolean;
  user?: User;
}

const Component: FC<ComponentProps> = ({
  name,
  age = 0,
  isActive = false,
  user
}) => {
  // ...
};
```

### 2. Output 이벤트 → 콜백 Props

**Angular**
```typescript
@Output() onClick = new EventEmitter<void>();
@Output() onSave = new EventEmitter<User>();
@Output() onDelete = new EventEmitter<number>();

handleClick(): void {
  this.onClick.emit();
}

handleSave(user: User): void {
  this.onSave.emit(user);
}
```

**React**
```typescript
interface ComponentProps {
  onClick: () => void;
  onSave: (user: User) => void;
  onDelete: (id: number) => void;
}

const Component: FC<ComponentProps> = ({
  onClick,
  onSave,
  onDelete
}) => {
  const handleSave = (user: User) => {
    onSave(user);
  };

  return (
    <button onClick={onClick}>Click</button>
  );
};
```

### 3. 로컬 상태 (Class Field → useState)

**Angular**
```typescript
export class TodoComponent {
  todos: Todo[] = [];
  newTodo = '';
  filter: 'all' | 'active' | 'completed' = 'all';

  addTodo(): void {
    if (this.newTodo.trim()) {
      this.todos.push({
        id: Date.now(),
        text: this.newTodo,
        completed: false
      });
      this.newTodo = '';
    }
  }

  toggleTodo(id: number): void {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
    }
  }
}
```

**React**
```typescript
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

type Filter = 'all' | 'active' | 'completed';

export const TodoComponent: FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos(prev => [...prev, {
        id: Date.now(),
        text: newTodo,
        completed: false
      }]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id
        ? { ...todo, completed: !todo.completed }
        : todo
    ));
  };

  return (
    // JSX
  );
};
```

### 4. 양방향 바인딩 → 제어 컴포넌트

**Angular**
```html
<input [(ngModel)]="username" type="text" />
<p>Hello, {{ username }}</p>
```

**React**
```tsx
const [username, setUsername] = useState('');

return (
  <>
    <input
      type="text"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
    />
    <p>Hello, {username}</p>
  </>
);
```

## 고급 패턴

### 1. 복잡한 State 업데이트

**불변성 유지가 중요합니다!**

```typescript
// ❌ 잘못된 방법 - 직접 수정
const [user, setUser] = useState({ name: 'John', age: 30 });
user.age = 31; // 작동하지 않음!

// ✅ 올바른 방법 - 새 객체 생성
setUser(prev => ({ ...prev, age: 31 }));

// 배열 업데이트
const [items, setItems] = useState([1, 2, 3]);

// 추가
setItems(prev => [...prev, 4]);

// 삭제
setItems(prev => prev.filter(item => item !== 2));

// 업데이트
setItems(prev => prev.map(item =>
  item === 2 ? 10 : item
));
```

### 2. 여러 State를 하나로 그룹화

**Angular**
```typescript
export class FormComponent {
  name = '';
  email = '';
  password = '';
  errors: Record<string, string> = {};
}
```

**React - 방법 1: 개별 State**
```typescript
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [errors, setErrors] = useState<Record<string, string>>({});
```

**React - 방법 2: 단일 객체 State (권장)**
```typescript
interface FormState {
  name: string;
  email: string;
  password: string;
  errors: Record<string, string>;
}

const [form, setForm] = useState<FormState>({
  name: '',
  email: '',
  password: '',
  errors: {}
});

// 업데이트
const updateField = (field: keyof FormState, value: any) => {
  setForm(prev => ({ ...prev, [field]: value }));
};
```

### 3. Derived State (파생 상태)

**Angular**
```typescript
export class ProductComponent {
  @Input() products: Product[] = [];

  get totalPrice(): number {
    return this.products.reduce((sum, p) => sum + p.price, 0);
  }

  get productCount(): number {
    return this.products.length;
  }
}
```

**React**
```typescript
interface ProductProps {
  products: Product[];
}

export const ProductComponent: FC<ProductProps> = ({ products }) => {
  // useMemo로 최적화 (선택사항)
  const totalPrice = useMemo(() =>
    products.reduce((sum, p) => sum + p.price, 0),
    [products]
  );

  // 간단한 계산은 직접 사용
  const productCount = products.length;

  return (
    <div>
      <p>Total: ${totalPrice}</p>
      <p>Count: {productCount}</p>
    </div>
  );
};
```

## 실전 예제

### 예제 1: 폼 처리

**Angular**
```typescript
export class LoginComponent {
  username = '';
  password = '';
  isLoading = false;
  error = '';

  async onSubmit(): Promise<void> {
    this.isLoading = true;
    this.error = '';

    try {
      await this.authService.login(this.username, this.password);
    } catch (err) {
      this.error = 'Login failed';
    } finally {
      this.isLoading = false;
    }
  }
}
```

**React**
```typescript
export const LoginComponent: FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await authService.login(username, password);
    } catch (err) {
      setError('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={isLoading}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
};
```

### 예제 2: 토글 상태

**Angular**
```typescript
export class AccordionComponent {
  isOpen = false;

  toggle(): void {
    this.isOpen = !this.isOpen;
  }
}
```

**React**
```typescript
export const Accordion: FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(prev => !prev);

  return (
    <div>
      <button onClick={toggle}>
        {isOpen ? 'Close' : 'Open'}
      </button>
      {isOpen && <div>Content...</div>}
    </div>
  );
};
```

## 마이그레이션 체크리스트

- [ ] `@Input` → Props 인터페이스 정의
- [ ] `@Output` → 콜백 함수 Props
- [ ] 클래스 필드 → `useState`로 변환
- [ ] Getter → `useMemo` 또는 계산식
- [ ] 양방향 바인딩 → 제어 컴포넌트 패턴
- [ ] 상태 업데이트 불변성 확인
- [ ] 이벤트 핸들러 변환
- [ ] 타입 정의 완성

## 실전 팁

### State 설계 원칙

1. **최소한의 State**: 계산 가능한 값은 State로 만들지 않기
2. **단일 진실 공급원**: 같은 데이터를 여러 State에 중복 저장 금지
3. **적절한 위치**: State는 필요한 가장 가까운 공통 부모에 배치

### 성능 최적화

```typescript
// ❌ 비효율적 - 매번 새 함수 생성
<Child onClick={() => handleClick(id)} />

// ✅ 효율적 - useCallback 사용
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

<Child onClick={handleClick} />
```

### 흔한 실수

❌ **잘못된 방법**
```typescript
// State를 직접 수정
state.value = 10;

// 이전 state를 참조하지 않고 업데이트
setCount(count + 1);
```

✅ **올바른 방법**
```typescript
// 새 객체/배열 생성
setState({ ...state, value: 10 });

// 함수형 업데이트 사용
setCount(prev => prev + 1);
```

## 다음 단계

Props와 State 관리를 이해했다면:
1. [라이프사이클 메서드](./04-lifecycle-methods)로 이동
2. `useEffect`로 사이드 이펙트 처리 학습
3. 복잡한 상태 관리는 [상태 관리](../part-02-advanced-patterns/04-state-management) 참조

## 관련 케이스

- [컴포넌트 기초](./02-component-basics)
- [라이프사이클 메서드](./04-lifecycle-methods)
- [Custom Hooks로 서비스 변환](../part-02-advanced-patterns/01-services-to-hooks)
