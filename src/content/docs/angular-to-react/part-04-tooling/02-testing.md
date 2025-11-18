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
| Jasmine | Jest / Vitest | 테스트 러너 및 assertion |
| Karma | Jest / Vitest | 테스트 환경 |
| TestBed | `render()` | 컴포넌트 렌더링 |
| DebugElement | `screen`, `getBy*` | DOM 쿼리 |
| `fixture.detectChanges()` | 자동 (상태 변경 시 즉시) | 변경 감지 |

## 패턴 1: 기본 컴포넌트 테스트

### Before (Angular + Jasmine)

```typescript
// user.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserComponent } from './user.component';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display user name', () => {
    component.user = { id: 1, name: 'John Doe' };
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('John Doe');
  });

  it('should call onDelete when delete button clicked', () => {
    spyOn(component, 'onDelete');
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(component.onDelete).toHaveBeenCalled();
  });
});
```

### After (React + Jest + RTL)

```typescript
// User.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { User } from './User';

describe('User', () => {
  it('should render user name', () => {
    const user = { id: 1, name: 'John Doe' };
    render(<User user={user} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should call onDelete when delete button clicked', () => {
    const onDelete = jest.fn();
    const user = { id: 1, name: 'John Doe' };

    render(<User user={user} onDelete={onDelete} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith(user.id);
  });
});
```

**주요 변경**:
- `TestBed.configureTestingModule` → `render()`
- `fixture.detectChanges()` → 불필요 (자동 감지)
- `spyOn` → `jest.fn()`
- DOM 쿼리 → `screen.getByRole`, `screen.getByText`

## 패턴 2: Async 테스트

### Before (Angular)

```typescript
it('should load user data', fakeAsync(() => {
  component.ngOnInit();
  tick(1000);
  fixture.detectChanges();

  expect(component.user).toBeDefined();
  expect(component.loading).toBe(false);
}));

// 또는
it('should load user data', async () => {
  component.ngOnInit();
  fixture.detectChanges();

  await fixture.whenStable();
  fixture.detectChanges();

  expect(component.user).toBeDefined();
});
```

### After (React + RTL)

```typescript
import { render, screen, waitFor } from '@testing-library/react';

it('should load user data', async () => {
  render(<UserProfile userId={1} />);

  // 로딩 상태 확인
  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  // 데이터 로드 대기
  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  // 로딩 상태 사라짐 확인
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
});

// 또는 findBy* 사용 (waitFor 내장)
it('should load user data', async () => {
  render(<UserProfile userId={1} />);

  const userName = await screen.findByText('John Doe');
  expect(userName).toBeInTheDocument();
});
```

**주요 변경**:
- `fakeAsync` + `tick` → `waitFor` 또는 `findBy*`
- `fixture.whenStable()` → `waitFor(() => {})`
- `findBy*`: `getBy*` + `waitFor` 조합

## 패턴 3: Service 모킹

### Before (Angular)

```typescript
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('UserComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [UserComponent],
      providers: [UserService]
    });

    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch users', () => {
    const mockUsers = [{ id: 1, name: 'John' }];

    component.ngOnInit();

    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);

    expect(component.users).toEqual(mockUsers);
  });

  afterEach(() => {
    httpMock.verify();
  });
});
```

### After (React + MSW - Mock Service Worker)

```typescript
// src/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([{ id: 1, name: 'John' }])
    );
  })
];

// src/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// src/test/setup.ts
import { server } from '../mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// UserList.test.tsx
import { render, screen } from '@testing-library/react';
import { UserList } from './UserList';

it('should fetch and display users', async () => {
  render(<UserList />);

  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  const userName = await screen.findByText('John');
  expect(userName).toBeInTheDocument();
});

// 특정 테스트에서 다른 응답 사용
it('should handle error', async () => {
  server.use(
    rest.get('/api/users', (req, res, ctx) => {
      return res(ctx.status(500));
    })
  );

  render(<UserList />);

  const errorMsg = await screen.findByText(/error/i);
  expect(errorMsg).toBeInTheDocument();
});
```

**장점**:
- 실제 HTTP 요청처럼 동작
- 재사용 가능한 mock 핸들러
- 네트워크 레벨 모킹

## 패턴 4: Form 테스트

### Before (Angular)

```typescript
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('LoginComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [LoginComponent]
    });
  });

  it('should validate form', () => {
    const emailInput = fixture.nativeElement.querySelector('#email');
    const passwordInput = fixture.nativeElement.querySelector('#password');

    emailInput.value = 'invalid-email';
    emailInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.loginForm.get('email').invalid).toBe(true);

    emailInput.value = 'test@example.com';
    passwordInput.value = 'password123';
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.loginForm.valid).toBe(true);
  });

  it('should submit form', () => {
    spyOn(component, 'onSubmit');
    const form = fixture.nativeElement.querySelector('form');

    form.dispatchEvent(new Event('submit'));
    expect(component.onSubmit).toHaveBeenCalled();
  });
});
```

### After (React + RTL)

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('LoginForm', () => {
  it('should validate email', async () => {
    render(<LoginForm onSubmit={jest.fn()} />);

    const emailInput = screen.getByLabelText(/email/i);

    // 잘못된 이메일
    await userEvent.type(emailInput, 'invalid-email');
    fireEvent.blur(emailInput);

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();

    // 올바른 이메일
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'test@example.com');
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.queryByText(/invalid email/i)).not.toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const onSubmit = jest.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');

    const submitButton = screen.getByRole('button', { name: /login/i });
    await userEvent.click(submitButton);

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });

  it('should not submit form with invalid data', async () => {
    const onSubmit = jest.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    const submitButton = screen.getByRole('button', { name: /login/i });
    await userEvent.click(submitButton);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });
});
```

**권장**: `fireEvent` 대신 `userEvent` 사용 (더 현실적인 사용자 상호작용)

## 패턴 5: Router 테스트

### Before (Angular)

```typescript
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

describe('NavigationComponent', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([
        { path: 'home', component: HomeComponent },
        { path: 'about', component: AboutComponent }
      ])],
      declarations: [NavigationComponent, HomeComponent, AboutComponent]
    });

    router = TestBed.inject(Router);
  });

  it('should navigate to home', fakeAsync(() => {
    const navigateSpy = spyOn(router, 'navigate');

    const homeLink = fixture.nativeElement.querySelector('a[href="/home"]');
    homeLink.click();
    tick();

    expect(navigateSpy).toHaveBeenCalledWith(['/home']);
  }));
});
```

### After (React + React Router + RTL)

```typescript
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

describe('Navigation', () => {
  const renderWithRouter = (initialRoute = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/" element={<Navigation />}>
            <Route path="home" element={<Home />} />
            <Route path="about" element={<About />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
  };

  it('should navigate to home', async () => {
    renderWithRouter();

    const homeLink = screen.getByRole('link', { name: /home/i });
    await userEvent.click(homeLink);

    expect(await screen.findByText(/home page/i)).toBeInTheDocument();
  });

  it('should render correct page based on route', () => {
    renderWithRouter('/about');

    expect(screen.getByText(/about page/i)).toBeInTheDocument();
  });
});
```

## 패턴 6: Context/Provider 테스트

### Before (Angular DI)

```typescript
describe('UserComponent', () => {
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);

    TestBed.configureTestingModule({
      declarations: [UserComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should show login button when not authenticated', () => {
    authService.isAuthenticated.and.returnValue(false);
    fixture.detectChanges();

    const loginButton = fixture.nativeElement.querySelector('.login-btn');
    expect(loginButton).toBeTruthy();
  });
});
```

### After (React Context)

```typescript
import { render, screen } from '@testing-library/react';
import { AuthContext } from '@/contexts/AuthContext';

describe('UserProfile', () => {
  const renderWithAuth = (isAuthenticated: boolean) => {
    return render(
      <AuthContext.Provider value={{ isAuthenticated, user: null, login: jest.fn(), logout: jest.fn() }}>
        <UserProfile />
      </AuthContext.Provider>
    );
  };

  it('should show login button when not authenticated', () => {
    renderWithAuth(false);

    const loginButton = screen.getByRole('button', { name: /login/i });
    expect(loginButton).toBeInTheDocument();
  });

  it('should show user profile when authenticated', () => {
    render(
      <AuthContext.Provider value={{
        isAuthenticated: true,
        user: { id: 1, name: 'John' },
        login: jest.fn(),
        logout: jest.fn()
      }}>
        <UserProfile />
      </AuthContext.Provider>
    );

    expect(screen.getByText('John')).toBeInTheDocument();
  });
});

// 재사용 가능한 wrapper 만들기
const createWrapper = (contextValue: AuthContextType) => {
  return ({ children }: { children: ReactNode }) => (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

it('should use wrapper', () => {
  const { rerender } = render(<UserProfile />, {
    wrapper: createWrapper({ isAuthenticated: true, user: { id: 1, name: 'John' }, login: jest.fn(), logout: jest.fn() })
  });

  expect(screen.getByText('John')).toBeInTheDocument();
});
```

## 패턴 7: Custom Hook 테스트

### React Hooks Testing Library 사용

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useUser } from '@/hooks/useUser';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('useUser', () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false }
      }
    });

    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };

  it('should fetch user data', async () => {
    const { result } = renderHook(() => useUser(1), {
      wrapper: createWrapper()
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      id: 1,
      name: 'John Doe'
    });
  });

  it('should handle error', async () => {
    server.use(
      rest.get('/api/users/:id', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result } = renderHook(() => useUser(999), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
```

## 패턴 8: Snapshot 테스트

### Before (Angular)

```typescript
it('should match snapshot', () => {
  fixture.detectChanges();
  expect(fixture).toMatchSnapshot();
});
```

### After (React)

```typescript
import { render } from '@testing-library/react';

it('should match snapshot', () => {
  const { container } = render(<UserCard user={{ id: 1, name: 'John' }} />);
  expect(container).toMatchSnapshot();
});

// 특정 요소만 snapshot
it('should match inline snapshot', () => {
  const { getByTestId } = render(<UserCard user={{ id: 1, name: 'John' }} />);
  expect(getByTestId('user-name')).toMatchInlineSnapshot(`
    <div data-testid="user-name">
      John
    </div>
  `);
});
```

**주의**: Snapshot은 남용하지 말 것 (깨지기 쉬움)

## 패턴 9: 접근성 테스트

### React + jest-axe

```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('UserForm accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<UserForm />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should have proper labels', () => {
    render(<UserForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should have proper button roles', () => {
    render(<UserForm />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeInTheDocument();
  });
});
```

## 패턴 10: Coverage 설정

### Before (Angular + Karma)

```javascript
// karma.conf.js
module.exports = function(config) {
  config.set({
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage'),
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'lcovonly' }
      ],
      fixWebpackSourcePaths: true
    }
  });
};
```

### After (Jest)

```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/**/*.stories.tsx',
    '!src/test/**'
  ],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  coverageReporters: ['text', 'lcov', 'html']
};
```

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

### Vitest 설정

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8', // 또는 'istanbul'
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'src/main.tsx'
      ],
      all: true,
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70
    }
  }
});
```

## 패턴 11: E2E 테스트 (Bonus)

### Before (Protractor - Angular)

```typescript
import { browser, by, element } from 'protractor';

describe('User List Page', () => {
  beforeEach(async () => {
    await browser.get('/users');
  });

  it('should display page title', async () => {
    const title = await element(by.css('h1')).getText();
    expect(title).toBe('Users');
  });

  it('should load users', async () => {
    const users = await element.all(by.css('.user-item'));
    expect(users.length).toBeGreaterThan(0);
  });
});
```

### After (Playwright - React)

```typescript
import { test, expect } from '@playwright/test';

test.describe('User List Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/users');
  });

  test('should display page title', async ({ page }) => {
    const title = page.locator('h1');
    await expect(title).toHaveText('Users');
  });

  test('should load users', async ({ page }) => {
    const users = page.locator('.user-item');
    await expect(users).toHaveCount(3);
  });

  test('should filter users by name', async ({ page }) => {
    await page.fill('input[placeholder="Search"]', 'John');
    const filteredUsers = page.locator('.user-item');
    await expect(filteredUsers).toHaveCount(1);
    await expect(filteredUsers.first()).toContainText('John');
  });
});
```

**Playwright 장점**:
- Protractor보다 빠름 (2-3배)
- 멀티 브라우저 지원 (Chrome, Firefox, Safari, Edge)
- 자동 대기 (waitFor 불필요)
- 더 나은 디버깅 도구

## 마이그레이션 체크리스트

### 설치 및 설정
- [ ] Jest 또는 Vitest 설치
- [ ] React Testing Library 설치
- [ ] `@testing-library/user-event` 설치
- [ ] `@testing-library/jest-dom` 설치
- [ ] MSW (Mock Service Worker) 설치
- [ ] 설정 파일 작성 (`jest.config.js` 또는 `vite.config.ts`)

### 테스트 환경
- [ ] `setup.ts` 파일 작성
- [ ] MSW handlers 작성
- [ ] Custom render 함수 작성 (Provider wrapper)
- [ ] Test utilities 작성

### 테스트 변환
- [ ] `describe` → `describe` (동일)
- [ ] `it` → `it` 또는 `test` (동일)
- [ ] `beforeEach` → `beforeEach` (동일)
- [ ] `TestBed.configureTestingModule` → `render()`
- [ ] `fixture.detectChanges()` 제거
- [ ] `spyOn` → `jest.fn()` 또는 `vi.fn()`
- [ ] DOM 쿼리 → `screen.getByRole`, `screen.getByText`
- [ ] `fakeAsync` + `tick` → `waitFor` 또는 `findBy*`

### 모킹
- [ ] HTTP 모킹 (MSW 사용)
- [ ] Module 모킹 (`jest.mock()`)
- [ ] Context/Provider 모킹

### CI/CD
- [ ] GitHub Actions 워크플로우 작성
- [ ] Coverage threshold 설정
- [ ] Coverage 리포트 업로드

## 테스팅 철학 변화

| Angular (TestBed) | React (RTL) | 이유 |
|------------------|-------------|------|
| 구현 상세 테스트 | 사용자 관점 테스트 | 리팩토링 안정성 |
| `fixture.componentInstance` 직접 접근 | Props/Events만 테스트 | 캡슐화 |
| `detectChanges()` 수동 호출 | 자동 렌더링 | 실제 동작과 일치 |
| DebugElement 쿼리 | 접근성 기반 쿼리 (`getByRole`) | a11y 개선 |

## 성능 비교

| 메트릭 | Karma + Jasmine | Jest | Vitest |
|-------|----------------|------|--------|
| 테스트 시작 시간 | 10-20초 | 3-5초 | 1-2초 |
| 단일 테스트 실행 | 0.5초 | 0.1초 | 0.05초 |
| Watch 모드 재실행 | 5-10초 | 1-2초 | 0.3초 |
| Coverage 생성 | 10-15초 | 5-7초 | 3-5초 |

## 실전 팁

**좋은 테스트 작성법**:
1. **사용자 관점으로 테스트**: `getByRole`, `getByLabelText` 사용
2. **접근성 고려**: `getByRole('button', { name: /submit/i })`
3. **userEvent 사용**: `fireEvent`보다 현실적
4. **waitFor 사용**: 비동기 상태 변경 대기
5. **MSW로 네트워크 모킹**: 실제와 가장 유사

**피해야 할 패턴**:
- ❌ `container.querySelector()` (구현 상세)
- ❌ 과도한 snapshot 테스트
- ❌ 내부 state 직접 테스트
- ❌ `act()` 경고 무시
- ❌ 테스트 간 의존성

**디버깅**:
```typescript
import { screen, logRoles } from '@testing-library/react';

// DOM 구조 출력
screen.debug();

// 특정 요소 출력
screen.debug(screen.getByRole('button'));

// 역할(role) 목록 출력
logRoles(container);

// 테스트 일시 정지
await screen.findByText('John', {}, { timeout: 10000 });
```

## 다음 단계

- [디버깅 전략](./03-debugging) - React DevTools 활용
- [성능 최적화](./04-performance) - 테스트 성능 개선
- [흔한 실수](../part-05-real-world/02-common-pitfalls) - 테스팅 안티패턴
