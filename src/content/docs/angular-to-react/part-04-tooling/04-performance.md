---
title: 성능 최적화
description: React 애플리케이션의 성능을 최적화하는 방법
sidebar:
  order: 4
---

# 성능 최적화

React 애플리케이션의 성능을 최적화하는 다양한 기법을 다룹니다.

## 개요

**마이그레이션 난이도**: ⭐⭐⭐⭐ (고급)
**예상 소요 시간**: 4-8시간

### 최적화 기법 개요

| 기법 | 개선율 | 적용 난이도 | 적용 시기 |
|-----|--------|------------|----------|
| **Code Splitting** | 40-60% | 중 | 초기 |
| **React.memo** | 20-40% | 저 | 불필요한 리렌더링 발견 시 |
| **useMemo/useCallback** | 10-30% | 중 | 무거운 계산/함수 전달 시 |
| **Virtualization** | 70-90% | 고 | 긴 리스트 렌더링 시 |
| **Lazy Loading** | 30-50% | 중 | 초기 |
| **Image Optimization** | 50-70% | 저 | 초기 |

## 패턴 1: React.memo로 불필요한 리렌더링 방지

### Before (최적화 전)

```typescript
// 부모 컴포넌트가 리렌더링되면 자식도 항상 리렌더링됨
export const UserCard = ({ user }: { user: User }) => {
  console.log('UserCard rendered');

  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
};

export const UserList = () => {
  const [count, setCount] = useState(0);
  const users = [
    { id: 1, name: 'John', email: 'john@example.com' },
    { id: 2, name: 'Jane', email: 'jane@example.com' }
  ];

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      {/* count가 변경되면 모든 UserCard가 리렌더링됨 */}
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
};
```

### After (React.memo 적용)

```typescript
import { memo } from 'react';

// Props가 변경되지 않으면 리렌더링 스킵
export const UserCard = memo(({ user }: { user: User }) => {
  console.log('UserCard rendered');

  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
});

UserCard.displayName = 'UserCard';

// Custom comparison function
export const UserCardWithCustomCompare = memo(
  ({ user, onDelete }: { user: User; onDelete: (id: number) => void }) => {
    return (
      <div className="user-card">
        <h3>{user.name}</h3>
        <button onClick={() => onDelete(user.id)}>Delete</button>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // true를 반환하면 리렌더링 스킵
    // false를 반환하면 리렌더링
    return prevProps.user.id === nextProps.user.id &&
           prevProps.user.name === nextProps.user.name;
  }
);
```

**결과**: count 변경 시 UserCard 리렌더링 **0회** (이전: 2회)

## 패턴 2: useMemo로 무거운 계산 캐싱

### Before (최적화 전)

```typescript
export const ProductList = ({ products }: { products: Product[] }) => {
  // 렌더링마다 매번 계산됨 (비효율)
  const expensiveProducts = products
    .filter(p => p.price > 1000)
    .sort((a, b) => b.price - a.price)
    .slice(0, 10);

  const totalPrice = products.reduce((sum, p) => sum + p.price, 0);

  return (
    <div>
      <h2>Total: ${totalPrice}</h2>
      {expensiveProducts.map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
};
```

### After (useMemo 적용)

```typescript
import { useMemo } from 'react';

export const ProductList = ({ products }: { products: Product[] }) => {
  // products가 변경될 때만 재계산
  const expensiveProducts = useMemo(() => {
    console.log('Computing expensive products...');
    return products
      .filter(p => p.price > 1000)
      .sort((a, b) => b.price - a.price)
      .slice(0, 10);
  }, [products]);

  const totalPrice = useMemo(() => {
    console.log('Computing total price...');
    return products.reduce((sum, p) => sum + p.price, 0);
  }, [products]);

  return (
    <div>
      <h2>Total: ${totalPrice}</h2>
      {expensiveProducts.map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
};
```

**주의**: 간단한 계산은 useMemo 불필요 (오버헤드만 증가)

```typescript
// ❌ 불필요한 useMemo
const fullName = useMemo(() => `${firstName} ${lastName}`, [firstName, lastName]);

// ✅ 그냥 계산
const fullName = `${firstName} ${lastName}`;
```

## 패턴 3: useCallback으로 함수 재생성 방지

### Before (최적화 전)

```typescript
export const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);

  // 렌더링마다 새 함수 생성 → 자식 컴포넌트 리렌더링
  const handleDelete = (id: number) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const handleToggle = (id: number) => {
    setTodos(todos.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  return (
    <div>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onDelete={handleDelete}
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
};
```

### After (useCallback 적용)

```typescript
import { useCallback } from 'react';

export const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);

  // 함수를 메모이제이션하여 자식에게 안정적인 참조 전달
  const handleDelete = useCallback((id: number) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  }, []); // 의존성 없음 (함수형 업데이트 사용)

  const handleToggle = useCallback((id: number) => {
    setTodos(prev => prev.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  }, []);

  return (
    <div>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onDelete={handleDelete}
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
};

// TodoItem도 memo로 감싸야 효과 있음
export const TodoItem = memo(({
  todo,
  onDelete,
  onToggle
}: TodoItemProps) => {
  console.log('TodoItem rendered:', todo.id);

  return (
    <div>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span>{todo.title}</span>
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </div>
  );
});
```

## 패턴 4: Code Splitting (React.lazy + Suspense)

### Before (전체 번들 로드)

```typescript
// App.tsx - 모든 페이지를 한 번에 로드
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { UserProfile } from './pages/UserProfile';
import { AdminPanel } from './pages/AdminPanel'; // 관리자만 사용

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/admin" element={<AdminPanel />} />
    </Routes>
  );
};

// 결과: 초기 번들 크기 500KB
```

### After (Lazy Loading)

```typescript
import { lazy, Suspense } from 'react';

// 필요할 때만 동적으로 로드
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

export const App = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Suspense>
  );
};

// 결과: 초기 번들 100KB + 각 페이지 50-100KB (필요 시 로드)
```

**중첩 Suspense (더 나은 UX)**:

```typescript
export const App = () => {
  return (
    <Suspense fallback={<AppShell />}>
      <Layout>
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Suspense>
      </Layout>
    </Suspense>
  );
};
```

## 패턴 5: Virtualization (긴 리스트 최적화)

### Before (10,000개 항목 렌더링)

```typescript
export const UserList = ({ users }: { users: User[] }) => {
  // 10,000개 DOM 노드 생성 → 매우 느림
  return (
    <div style={{ height: '600px', overflow: 'auto' }}>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
};

// 결과: 초기 렌더링 3-5초, 스크롤 버벅임
```

### After (react-window 사용)

```typescript
import { FixedSizeList } from 'react-window';

export const UserList = ({ users }: { users: User[] }) => {
  // 보이는 영역만 렌더링 (약 10-15개)
  return (
    <FixedSizeList
      height={600}
      itemCount={users.length}
      itemSize={80}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <UserCard user={users[index]} />
        </div>
      )}
    </FixedSizeList>
  );
};

// 결과: 초기 렌더링 0.1초, 부드러운 스크롤
```

**가변 높이 리스트 (react-window)**:

```typescript
import { VariableSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

export const MessageList = ({ messages }: { messages: Message[] }) => {
  const listRef = useRef<VariableSizeList>(null);

  // 각 항목의 높이를 동적으로 계산
  const getItemSize = (index: number) => {
    const message = messages[index];
    const baseHeight = 60;
    const contentHeight = message.content.length / 50 * 20;
    return baseHeight + contentHeight;
  };

  return (
    <AutoSizer>
      {({ height, width }) => (
        <VariableSizeList
          ref={listRef}
          height={height}
          width={width}
          itemCount={messages.length}
          itemSize={getItemSize}
        >
          {({ index, style }) => (
            <div style={style}>
              <MessageCard message={messages[index]} />
            </div>
          )}
        </VariableSizeList>
      )}
    </AutoSizer>
  );
};
```

## 패턴 6: 이미지 최적화

### Before (최적화 전)

```typescript
export const ProductImage = ({ src, alt }: { src: string; alt: string }) => {
  return <img src={src} alt={alt} />;
};

// 문제점:
// 1. 모든 이미지 즉시 로드 (네트워크 낭비)
// 2. 원본 크기 그대로 로드 (5MB PNG)
// 3. 포맷 최적화 없음
```

### After (최적화 후)

```typescript
// 1. Lazy loading
export const ProductImage = ({ src, alt }: { src: string; alt: string }) => {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
    />
  );
};

// 2. Responsive images + Modern formats
export const OptimizedImage = ({ src, alt }: { src: string; alt: string }) => {
  return (
    <picture>
      {/* WebP (80% smaller) */}
      <source
        srcSet={`${src}.webp 1x, ${src}@2x.webp 2x`}
        type="image/webp"
      />
      {/* AVIF (90% smaller, 최신 브라우저) */}
      <source
        srcSet={`${src}.avif 1x, ${src}@2x.avif 2x`}
        type="image/avif"
      />
      {/* Fallback */}
      <img
        src={`${src}.jpg`}
        srcSet={`${src}.jpg 1x, ${src}@2x.jpg 2x`}
        alt={alt}
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
};

// 3. Blur placeholder (like Next.js Image)
export const ImageWithPlaceholder = ({ src, alt }: ImageProps) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      {/* Blur placeholder */}
      {!loaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `url(${src}?w=20&blur=10)`,
            backgroundSize: 'cover',
            filter: 'blur(10px)'
          }}
        />
      )}

      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.3s' }}
      />
    </div>
  );
};
```

## 패턴 7: Debouncing & Throttling

### Before (매 입력마다 API 호출)

```typescript
export const SearchUsers = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);

  const handleSearch = (value: string) => {
    setQuery(value);

    // 매 키 입력마다 API 호출 → 서버 부하
    fetch(`/api/users/search?q=${value}`)
      .then(r => r.json())
      .then(setResults);
  };

  return (
    <input
      value={query}
      onChange={(e) => handleSearch(e.target.value)}
    />
  );
};

// 결과: "react"를 입력하면 5번의 API 호출
// r -> re -> rea -> reac -> react
```

### After (Debounced search)

```typescript
import { useEffect, useState } from 'react';

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export const SearchUsers = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);

  // 300ms 대기 후 실제 검색
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      fetch(`/api/users/search?q=${debouncedQuery}`)
        .then(r => r.json())
        .then(setResults);
    }
  }, [debouncedQuery]);

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search users..."
    />
  );
};

// 결과: "react"를 입력해도 1번의 API 호출 (마지막만)
```

**Throttle (스크롤 이벤트 등)**:

```typescript
function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastExecuted = useRef(Date.now());

  useEffect(() => {
    if (Date.now() >= lastExecuted.current + interval) {
      lastExecuted.current = Date.now();
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, interval);

      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
}

// 사용: 스크롤 위치 추적 (100ms마다 한 번만)
export const ScrollTracker = () => {
  const [scrollY, setScrollY] = useState(0);
  const throttledScrollY = useThrottle(scrollY, 100);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return <div>Scroll: {throttledScrollY}px</div>;
};
```

## 패턴 8: Web Workers (무거운 계산 오프로드)

### Before (메인 스레드 블로킹)

```typescript
export const DataProcessor = ({ data }: { data: number[] }) => {
  const [result, setResult] = useState<number>(0);

  const processData = () => {
    // 무거운 계산 (UI 멈춤)
    let sum = 0;
    for (let i = 0; i < 1000000000; i++) {
      sum += data[i % data.length] * Math.sqrt(i);
    }
    setResult(sum);
  };

  return (
    <div>
      <button onClick={processData}>Process</button>
      <div>Result: {result}</div>
    </div>
  );
};

// 결과: 버튼 클릭 시 UI 5-10초 멈춤
```

### After (Web Worker 사용)

```typescript
// worker.ts
self.onmessage = (e: MessageEvent<number[]>) => {
  const data = e.data;

  let sum = 0;
  for (let i = 0; i < 1000000000; i++) {
    sum += data[i % data.length] * Math.sqrt(i);
  }

  self.postMessage(sum);
};

// DataProcessor.tsx
export const DataProcessor = ({ data }: { data: number[] }) => {
  const [result, setResult] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const workerRef = useRef<Worker>();

  useEffect(() => {
    workerRef.current = new Worker(new URL('./worker.ts', import.meta.url));

    workerRef.current.onmessage = (e: MessageEvent<number>) => {
      setResult(e.data);
      setIsProcessing(false);
    };

    return () => workerRef.current?.terminate();
  }, []);

  const processData = () => {
    setIsProcessing(true);
    workerRef.current?.postMessage(data);
  };

  return (
    <div>
      <button onClick={processData} disabled={isProcessing}>
        {isProcessing ? 'Processing...' : 'Process'}
      </button>
      <div>Result: {result}</div>
    </div>
  );
};

// 결과: UI는 멈추지 않고 백그라운드에서 계산
```

## 패턴 9: React 18 Concurrent Features

### useTransition (긴급/지연 업데이트 분리)

```typescript
import { useState, useTransition } from 'react';

export const SearchWithTransition = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (value: string) => {
    // 긴급: 입력 값은 즉시 업데이트 (사용자 경험)
    setQuery(value);

    // 지연 가능: 검색 결과는 천천히 업데이트해도 됨
    startTransition(() => {
      const filtered = largeDataset.filter(item =>
        item.toLowerCase().includes(value.toLowerCase())
      );
      setResults(filtered);
    });
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {isPending && <div>Updating...</div>}

      <ul>
        {results.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
};
```

### useDeferredValue (파생 값 지연)

```typescript
import { useDeferredValue, useMemo } from 'react';

export const ProductFilter = ({ products }: { products: Product[] }) => {
  const [filter, setFilter] = useState('');

  // filter는 즉시 업데이트, deferredFilter는 지연 업데이트
  const deferredFilter = useDeferredValue(filter);

  // deferredFilter 기반으로 필터링 (지연됨)
  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(deferredFilter.toLowerCase())
    );
  }, [products, deferredFilter]);

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      {/* 입력 중에는 약간 흐릿하게 */}
      <div style={{ opacity: filter !== deferredFilter ? 0.5 : 1 }}>
        {filteredProducts.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
};
```

## 패턴 10: Bundle Size 최적화

### Tree Shaking (불필요한 코드 제거)

```typescript
// ❌ 잘못된 import (전체 라이브러리 포함)
import _ from 'lodash'; // 500KB
import * as MUI from '@mui/material'; // 2MB

// ✅ 올바른 import (필요한 것만)
import debounce from 'lodash/debounce'; // 10KB
import { Button, TextField } from '@mui/material'; // 50KB
```

### Dynamic Import (조건부 로드)

```typescript
export const AdminPanel = () => {
  const [showChart, setShowChart] = useState(false);

  const handleShowChart = async () => {
    // Chart.js는 필요할 때만 로드 (300KB)
    const { Chart } = await import('chart.js/auto');

    // 차트 생성
    new Chart(/* ... */);
    setShowChart(true);
  };

  return (
    <div>
      <button onClick={handleShowChart}>Show Chart</button>
      {showChart && <canvas id="chart" />}
    </div>
  );
};
```

### Vite 번들 최적화

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // node_modules를 벤더 청크로 분리
          if (id.includes('node_modules')) {
            // 큰 라이브러리는 별도 청크로
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@mui')) {
              return 'mui-vendor';
            }
            if (id.includes('react-query')) {
              return 'react-query-vendor';
            }
            return 'vendor';
          }
        }
      }
    },
    // 청크 크기 제한
    chunkSizeWarningLimit: 500
  }
});
```

## 패턴 11: Font 최적화

### Before (최적화 전)

```css
/* 모든 글꼴 무게(weight) 로드 */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap');

/* 결과: 600KB 폰트 파일 */
```

### After (최적화 후)

```typescript
// 1. 필요한 weight만 로드
// index.html
<link
  rel="preconnect"
  href="https://fonts.googleapis.com"
/>
<link
  rel="preconnect"
  href="https://fonts.gstatic.com"
  crossOrigin="anonymous"
/>
<link
  href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
  rel="stylesheet"
/>

// 2. Font preloading
<link
  rel="preload"
  href="/fonts/Roboto-Regular.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous"
/>

// 3. Font subsetting (한국어만 필요한 경우)
<link
  href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&subset=korean&display=swap"
  rel="stylesheet"
/>
```

```css
/* 4. font-display 최적화 */
@font-face {
  font-family: 'Roboto';
  src: url('/fonts/Roboto-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap; /* FOIT 방지, 즉시 fallback 폰트 표시 */
}
```

## 패턴 12: State Colocation (상태 로컬화)

### Before (전역 상태)

```typescript
// 모든 상태를 최상위에 관리
export const App = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  return (
    <div>
      <UserList
        users={users}
        filterQuery={filterQuery}
        onFilterChange={setFilterQuery}
        onSelectUser={setSelectedUserId}
      />

      <UserModal
        isOpen={isModalOpen}
        userId={selectedUserId}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

// 문제: App이 리렌더링되면 모든 자식도 리렌더링
```

### After (State Colocation)

```typescript
// 상태를 실제 사용하는 컴포넌트로 이동
export const App = () => {
  const [users, setUsers] = useState<User[]>([]);

  return (
    <div>
      {/* filterQuery는 UserList 내부로 */}
      <UserList users={users} />

      {/* 모달 상태도 독립적으로 */}
      <UserModalTrigger />
    </div>
  );
};

const UserList = ({ users }: { users: User[] }) => {
  const [filterQuery, setFilterQuery] = useState('');

  const filteredUsers = users.filter(u =>
    u.name.includes(filterQuery)
  );

  return (
    <div>
      <input
        value={filterQuery}
        onChange={(e) => setFilterQuery(e.target.value)}
      />
      {filteredUsers.map(u => <UserCard key={u.id} user={u} />)}
    </div>
  );
};

const UserModalTrigger = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open</button>
      {isOpen && (
        <UserModal
          userId={userId}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

// 결과: filterQuery 변경 시 UserList만 리렌더링
```

## 성능 측정 도구

### 1. React DevTools Profiler

```typescript
import { Profiler, ProfilerOnRenderCallback } from 'react';

const onRender: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  console.table({
    Component: id,
    Phase: phase,
    'Actual Duration': `${actualDuration.toFixed(2)}ms`,
    'Base Duration': `${baseDuration.toFixed(2)}ms`,
    'Start Time': startTime,
    'Commit Time': commitTime
  });
};

export const App = () => (
  <Profiler id="App" onRender={onRender}>
    <YourApp />
  </Profiler>
);
```

### 2. Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on: [push]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci && npm run build
      - run: npm install -g @lhci/cli
      - run: lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

### 3. Web Vitals 측정

```typescript
// reportWebVitals.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

export const reportWebVitals = (onPerfEntry?: (metric: any) => void) => {
  if (onPerfEntry) {
    onCLS(onPerfEntry);
    onFID(onPerfEntry);
    onFCP(onPerfEntry);
    onLCP(onPerfEntry);
    onTTFB(onPerfEntry);
  }
};

// main.tsx
reportWebVitals((metric) => {
  console.log(metric);

  // 분석 서비스로 전송
  if (window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.value),
      event_label: metric.id,
      non_interaction: true
    });
  }
});
```

## 성능 최적화 체크리스트

### 초기 로딩 최적화
- [ ] Code splitting (React.lazy)
- [ ] Route-based splitting
- [ ] Critical CSS inline
- [ ] Preload/Prefetch 설정
- [ ] Font 최적화 (subset, preload)
- [ ] Image 최적화 (WebP, lazy loading)

### 렌더링 최적화
- [ ] React.memo (불필요한 리렌더링 방지)
- [ ] useMemo (무거운 계산 캐싱)
- [ ] useCallback (함수 메모이제이션)
- [ ] State colocation (상태 로컬화)
- [ ] Virtualization (긴 리스트)

### 네트워크 최적화
- [ ] API 응답 캐싱 (React Query, SWR)
- [ ] Debouncing (검색 등)
- [ ] Request deduplication
- [ ] Optimistic updates
- [ ] Service Worker (오프라인 지원)

### 번들 최적화
- [ ] Tree shaking 확인
- [ ] Dynamic imports
- [ ] Manual chunks 설정
- [ ] 불필요한 의존성 제거
- [ ] Bundle analyzer 실행

### 모니터링
- [ ] Lighthouse CI 설정
- [ ] Web Vitals 측정
- [ ] React DevTools Profiler 사용
- [ ] 실사용 환경 성능 모니터링 (Sentry, LogRocket)

## 성능 벤치마크

### 최적화 전후 비교

| 메트릭 | 최적화 전 | 최적화 후 | 개선율 |
|-------|----------|----------|--------|
| **FCP** (First Contentful Paint) | 2.8초 | 0.9초 | **68% 빠름** |
| **LCP** (Largest Contentful Paint) | 4.5초 | 1.2초 | **73% 빠름** |
| **TTI** (Time to Interactive) | 6.2초 | 2.1초 | **66% 빠름** |
| **번들 크기** | 850KB | 320KB | **62% 감소** |
| **초기 로드 시간** | 5.1초 | 1.8초 | **65% 빠름** |

### 최적화 기법별 효과

| 기법 | 적용 전 | 적용 후 | 개선 효과 |
|-----|--------|--------|----------|
| Code Splitting | 850KB | 320KB | 초기 로드 **2.5초 단축** |
| React.memo | 초당 8 렌더 | 초당 2 렌더 | 리렌더링 **75% 감소** |
| Virtualization | 10,000 DOM 노드 | 15 DOM 노드 | 렌더링 시간 **95% 단축** |
| Image Optimization | 5MB | 500KB | 이미지 로드 **90% 빠름** |
| React Query 캐싱 | 3초 | 0.1초 | API 응답 **96% 빠름** |

## 실전 팁

**언제 최적화해야 하나?**:
1. **하지 말아야 할 때**:
   - 문제가 없을 때 (premature optimization)
   - 작은 컴포넌트 (<10줄)
   - 간단한 계산

2. **해야 할 때**:
   - Lighthouse 점수 < 90
   - 사용자가 "느리다"고 불평
   - React DevTools에서 느린 렌더링 발견
   - 긴 리스트 렌더링 (>100 항목)

**흔한 실수**:
- ❌ 모든 컴포넌트에 memo 적용 (오버헤드)
- ❌ 간단한 계산에 useMemo 사용
- ❌ 의존성 배열 잘못 설정
- ❌ 최적화 전 측정 안 함

**최적화 순서**:
1. **측정**: React DevTools Profiler, Lighthouse
2. **병목 찾기**: 가장 느린 부분 확인
3. **적용**: 해당 부분만 최적화
4. **재측정**: 개선 효과 확인
5. **반복**: 목표 달성까지

## 다음 단계

- [빌드 도구](./01-build-tools) - 번들 크기 최적화
- [테스팅](./02-testing) - 성능 회귀 테스트
- [실전 사례](../part-05-real-world/01-incremental-migration) - 실제 프로젝트 최적화 경험
