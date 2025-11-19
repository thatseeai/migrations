---
title: 디버깅 전략
description: React 애플리케이션의 효과적인 디버깅 방법
sidebar:
  order: 3
---

React 애플리케이션을 효과적으로 디버깅하는 방법을 다룹니다.

## 개요

**마이그레이션 난이도**: ⭐⭐ (초급-중급)
**예상 소요 시간**: 1-2시간

### 디버깅 도구

| 도구 | 용도 | 필수도 | 다운로드 |
|------|------|--------|---------|
| **React DevTools** | 컴포넌트 검사 | ✅ 필수 | [Chrome](https://chrome.google.com/webstore) |
| **Redux DevTools** | 상태 디버깅 | ⚠️ Redux 사용 시 | [Chrome](https://chrome.google.com/webstore) |
| **React Query DevTools** | 쿼리 디버깅 | ⚠️ React Query 사용 시 | npm 패키지 |
| **Chrome DevTools** | 일반 디버깅 | ✅ 필수 | 내장 |
| **Why Did You Render** | 리렌더링 추적 | 🔧 성능 분석 시 | npm 패키지 |

## 패턴 1: React DevTools 기본 사용

### Angular Augury vs React DevTools

**Before (Angular Augury)**:
- Component Tree 보기
- Props/Inputs 확인
- Injected Services 확인
- Change Detection 추적

**After (React DevTools)**:
- Component Tree 보기
- Props/State/Hooks 확인
- Context 값 확인
- Profiler로 성능 측정

### React DevTools 주요 기능

```typescript
// 컴포넌트에 디버깅 정보 추가
export const UserProfile = ({ user }: UserProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);

  // DevTools에서 이 컴포넌트를 쉽게 찾기 위한 display name
  UserProfile.displayName = 'UserProfile';

  // Custom Hook에도 name 지정
  const userData = useUser(user.id);

  return (
    <div>
      <h1>{user.name}</h1>
      {/* ... */}
    </div>
  );
};

// Custom Hook에 display name 추가
function useUser(userId: number) {
  // ...
}
useUser.displayName = 'useUser';
```

**DevTools에서 확인 가능한 정보**:
1. **Components 탭**:
   - Props 값
   - State 값
   - Hooks 순서 및 값
   - Context 값
   - Rendered by (부모 컴포넌트)

2. **Profiler 탭**:
   - 컴포넌트 렌더링 시간
   - 왜 렌더링됐는지 (props change, state change, etc.)
   - Flame graph (시각화)

## 패턴 2: console 디버깅

### Before (Angular)

```typescript
export class UserComponent implements OnInit {
  constructor() {
    console.log('UserComponent constructor');
  }

  ngOnInit() {
    console.log('ngOnInit called');
    console.log('User:', this.user);
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('Changes:', changes);
  }

  ngOnDestroy() {
    console.log('Component destroyed');
  }
}
```

### After (React)

```typescript
export const UserProfile = ({ user }: UserProfileProps) => {
  // 렌더링 추적
  console.log('[UserProfile] Render', { user });

  useEffect(() => {
    console.log('[UserProfile] Mounted');

    return () => {
      console.log('[UserProfile] Unmounted');
    };
  }, []);

  useEffect(() => {
    console.log('[UserProfile] User changed:', user);
  }, [user]);

  // 렌더링 이유 추적 (Custom Hook)
  useWhyDidYouUpdate('UserProfile', { user });

  return <div>{user.name}</div>;
};

// useWhyDidYouUpdate Hook
function useWhyDidYouUpdate(name: string, props: Record<string, any>) {
  const previousProps = useRef(props);

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps: Record<string, { from: any; to: any }> = {};

      allKeys.forEach((key) => {
        if (previousProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current[key],
            to: props[key]
          };
        }
      });

      if (Object.keys(changedProps).length > 0) {
        console.log('[why-did-you-update]', name, changedProps);
      }
    }

    previousProps.current = props;
  });
}
```

## 패턴 3: Debugger 중단점 사용

### Chrome DevTools Debugger

```typescript
export const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers().then((data) => {
      // 중단점 1: 코드에 직접 삽입
      debugger;

      setUsers(data);
    });
  }, []);

  const handleDelete = (id: number) => {
    // 중단점 2: 조건부 중단
    if (id === 123) {
      debugger;
    }

    deleteUser(id);
  };

  return (
    <div>
      {users.map((user) => (
        <UserCard key={user.id} user={user} onDelete={handleDelete} />
      ))}
    </div>
  );
};
```

**Chrome DevTools 단축키**:
- `F8`: 다음 중단점까지 실행
- `F10`: Step over (다음 줄)
- `F11`: Step into (함수 안으로)
- `Shift+F11`: Step out (함수 밖으로)
- `Ctrl+Shift+E`: 선택한 코드 실행

## 패턴 4: React DevTools Profiler

### 성능 병목 찾기

```typescript
import { Profiler, ProfilerOnRenderCallback } from 'react';

const onRenderCallback: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);

  // 느린 렌더링 경고
  if (actualDuration > 16) {
    console.warn(`⚠️ Slow render detected in ${id}: ${actualDuration}ms`);
  }
};

export const App = () => {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <UserDashboard />
    </Profiler>
  );
};

// 프로덕션 환경에서는 Profiler 비활성화
const ProfilerWrapper = process.env.NODE_ENV === 'development' ? Profiler : Fragment;

export const OptimizedApp = () => {
  return (
    <ProfilerWrapper id="App" onRender={onRenderCallback}>
      <UserDashboard />
    </ProfilerWrapper>
  );
};
```

## 패턴 5: Redux DevTools

### State 변경 추적

```typescript
// store.ts
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';

export const store = configureStore({
  reducer: {
    user: userReducer
  },
  // Redux DevTools 자동 활성화 (개발 환경)
  devTools: process.env.NODE_ENV !== 'production'
});

// DevTools에서 확인 가능:
// 1. 모든 action 히스토리
// 2. State diff (변경 전/후)
// 3. Time travel (과거 상태로 되돌리기)
// 4. Action dispatch (수동)
// 5. State export/import
```

**Redux DevTools 주요 기능**:
1. **Inspector**: Action과 State 변경 확인
2. **Diff**: 변경 사항만 하이라이트
3. **Trace**: Action이 디스패치된 위치 추적
4. **Chart**: State 구조 시각화

## 패턴 6: React Query DevTools

### 서버 상태 디버깅

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 개발 환경에서만 refetch 비활성화
      refetchOnWindowFocus: process.env.NODE_ENV === 'production'
    }
  }
});

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Main />

      {/* 개발 환경에서만 DevTools 표시 */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
    </QueryClientProvider>
  );
};
```

**React Query DevTools 기능**:
- 모든 query 상태 확인 (loading, success, error, stale)
- Query 데이터 및 메타 정보
- Refetch, Invalidate, Reset 수동 실행
- Query 캐시 시각화

## 패턴 7: Error Boundary

### Before (Angular ErrorHandler)

```typescript
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: Error) {
    console.error('Global error:', error);
    // 에러 로깅 서비스로 전송
  }
}

@NgModule({
  providers: [
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ]
})
export class AppModule {}
```

### After (React Error Boundary)

```typescript
import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    // 에러 로깅 서비스로 전송
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!);
      }

      return (
        <div role="alert">
          <h2>Something went wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error?.toString()}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

// 사용
export const App = () => {
  return (
    <ErrorBoundary fallback={(error) => <ErrorFallback error={error} />}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/users" element={
            // 중첩된 Error Boundary (특정 페이지만)
            <ErrorBoundary>
              <UserList />
            </ErrorBoundary>
          } />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};
```

## 패턴 8: 커스텀 Devtools Component

### 개발 환경 전용 디버그 패널

```typescript
import { useState } from 'react';

export const DevPanel = () => {
  const [isOpen, setIsOpen] = useState(false);

  // 프로덕션에서는 렌더링 안 함
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: 10,
          right: 10,
          zIndex: 9999
        }}
      >
        🔧 Dev Panel
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: 50,
          right: 10,
          width: 300,
          maxHeight: 400,
          overflow: 'auto',
          background: 'white',
          border: '1px solid #ccc',
          padding: 10,
          zIndex: 9999
        }}>
          <h3>Debug Info</h3>

          <section>
            <h4>Environment</h4>
            <pre>{JSON.stringify({
              NODE_ENV: process.env.NODE_ENV,
              API_URL: import.meta.env.VITE_API_URL
            }, null, 2)}</pre>
          </section>

          <section>
            <h4>Actions</h4>
            <button onClick={() => localStorage.clear()}>
              Clear LocalStorage
            </button>
            <button onClick={() => sessionStorage.clear()}>
              Clear SessionStorage
            </button>
            <button onClick={() => {
              // 강제 에러 발생
              throw new Error('Test error');
            }}>
              Trigger Error
            </button>
          </section>
        </div>
      )}
    </>
  );
};

// App.tsx
export const App = () => {
  return (
    <>
      <Router>
        <Routes>{/* ... */}</Routes>
      </Router>

      <DevPanel />
    </>
  );
};
```

## 패턴 9: Source Maps 설정

### 프로덕션 디버깅

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // 프로덕션에서도 source map 생성 (디버깅용)
    sourcemap: true,

    // 또는 hidden source map (보안 위해 URL 숨김)
    sourcemap: 'hidden',

    // 또는 개발 환경에서만
    sourcemap: process.env.NODE_ENV === 'development'
  }
});
```

**Source Map 종류**:
- `true`: 외부 파일 (.js.map)
- `'inline'`: 번들에 포함
- `'hidden'`: 파일은 생성하지만 URL 참조 없음 (에러 로깅 서비스 전용)

## 패턴 10: Logging 전략

### 구조화된 로깅

```typescript
// logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDev = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, message: string, data?: any) {
    if (!this.isDev && level === 'debug') return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    const logFn = level === 'error' ? console.error :
                  level === 'warn' ? console.warn :
                  console.log;

    if (data) {
      logFn(prefix, message, data);
    } else {
      logFn(prefix, message);
    }

    // 프로덕션에서는 로깅 서비스로 전송
    if (!this.isDev && (level === 'error' || level === 'warn')) {
      this.sendToLoggingService({ level, message, data, timestamp });
    }
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error | any) {
    this.log('error', message, error);
  }

  private sendToLoggingService(log: any) {
    // Sentry, LogRocket, etc.
    if (window.Sentry) {
      window.Sentry.captureException(log);
    }
  }
}

export const logger = new Logger();

// 사용
export const UserService = {
  async getUser(id: number) {
    logger.debug('Fetching user', { id });

    try {
      const user = await fetch(`/api/users/${id}`).then(r => r.json());
      logger.info('User fetched successfully', { id, user });
      return user;
    } catch (error) {
      logger.error('Failed to fetch user', { id, error });
      throw error;
    }
  }
};
```

## 패턴 11: Performance 측정

### React 18+ 동시성 기능 활용

```typescript
import { startTransition, useTransition } from 'react';

export const SearchUsers = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (value: string) => {
    // 긴급: 입력 값 즉시 업데이트
    setQuery(value);

    // 지연 가능: 검색 결과는 천천히 업데이트
    startTransition(() => {
      const filtered = users.filter(u =>
        u.name.toLowerCase().includes(value.toLowerCase())
      );
      setResults(filtered);
    });
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search..."
      />

      {isPending && <div>Updating results...</div>}

      <UserList users={results} />
    </div>
  );
};

// Performance.measure API
export const measurePerformance = (name: string, fn: () => void) => {
  performance.mark(`${name}-start`);
  fn();
  performance.mark(`${name}-end`);
  performance.measure(name, `${name}-start`, `${name}-end`);

  const measure = performance.getEntriesByName(name)[0];
  console.log(`${name} took ${measure.duration}ms`);

  // Cleanup
  performance.clearMarks();
  performance.clearMeasures();
};

// 사용
measurePerformance('render-user-list', () => {
  render(<UserList users={largeUserArray} />);
});
```

## 디버깅 체크리스트

### 개발 환경 설정
- [ ] React DevTools 설치
- [ ] Redux DevTools 설치 (Redux 사용 시)
- [ ] React Query DevTools 설정 (React Query 사용 시)
- [ ] Source maps 활성화
- [ ] ESLint warnings 해결

### 로깅
- [ ] 구조화된 Logger 구현
- [ ] 개발/프로덕션 환경 분리
- [ ] Error Boundary 설정
- [ ] 에러 로깅 서비스 연동 (Sentry, LogRocket 등)

### 성능 모니터링
- [ ] React Profiler 설정
- [ ] useWhyDidYouUpdate Hook 작성
- [ ] Performance API 활용
- [ ] Lighthouse 정기 실행

## 흔한 디버깅 시나리오

### 1. "컴포넌트가 리렌더링되지 않아요"

**원인**:
- State 변경이 감지되지 않음 (객체 mutate)
- Props 비교 실패 (memo 사용 시)

**해결**:
```typescript
// ❌ 잘못된 방법 (mutation)
const handleUpdate = () => {
  user.name = 'New Name';
  setUser(user);  // React는 변경 감지 못함
};

// ✅ 올바른 방법 (새 객체 생성)
const handleUpdate = () => {
  setUser({ ...user, name: 'New Name' });
};
```

### 2. "무한 루프에 빠졌어요"

**원인**:
- useEffect 의존성 배열 잘못 설정

**해결**:
```typescript
// ❌ 잘못된 방법
useEffect(() => {
  setCount(count + 1);  // count 변경 → 리렌더링 → useEffect 재실행 → 무한 루프
}, [count]);

// ✅ 올바른 방법
useEffect(() => {
  setCount(c => c + 1);  // 함수형 업데이트
}, []);  // 빈 배열 (한 번만 실행)
```

### 3. "이전 props/state 값이 보여요"

**원인**:
- Closure 문제

**해결**:
```typescript
// ❌ 잘못된 방법
useEffect(() => {
  const interval = setInterval(() => {
    console.log(count);  // 항상 초기값 0
  }, 1000);
  return () => clearInterval(interval);
}, []);

// ✅ 올바른 방법
useEffect(() => {
  const interval = setInterval(() => {
    console.log(count);  // 최신 값
  }, 1000);
  return () => clearInterval(interval);
}, [count]);  // 의존성 추가
```

## 실전 팁

**Chrome DevTools 활용**:
1. **Ctrl+Shift+P** → "Show Coverage": 사용하지 않는 코드 확인
2. **Performance 탭**: 렌더링 병목 찾기
3. **Network 탭**: API 호출 디버깅
4. **Application 탭**: LocalStorage, Cookies 확인

**React DevTools 활용**:
1. **Highlight Updates**: 리렌더링되는 컴포넌트 시각화
2. **Profiler**: 각 컴포넌트 렌더링 시간 측정
3. **Component Stack**: 에러 발생 위치 추적

**디버깅 순서**:
1. 에러 메시지 읽기 (Stack trace 확인)
2. React DevTools로 props/state 확인
3. console.log로 값 확인
4. Debugger 중단점 설정
5. 재현 가능한 최소 예제 만들기

## 다음 단계

- [성능 최적화](./04-performance) - 성능 병목 해결
- [흔한 실수](../part-05-real-world/02-common-pitfalls) - 디버깅이 필요한 일반적인 실수들
- [빌드 도구](./01-build-tools) - Source map 설정
