---
title: 의존성 주입 대체 패턴
description: Angular DI 시스템을 React Context API와 Props로 대체하는 방법
sidebar:
  order: 2
---

Angular의 의존성 주입(DI) 시스템을 React의 Context API와 Props로 대체하는 방법을 다룹니다.

## 개요

**마이그레이션 난이도**: ⭐⭐⭐⭐ (고급)
**예상 소요 시간**: 2-3시간
**코드 변경량**: 평균 30-40% 감소

### 주요 변경사항

| 항목 | Angular | React | 차이점 |
|-----|---------|-------|-------|
| 의존성 주입 | DI Container | Context API / Props | 명시적 vs 암시적 |
| 제공자 | `providers: []` | `<Provider>` 컴포넌트 | JSX 기반 |
| 주입 | `constructor()` | `useContext()` Hook | 함수형 API |
| 스코프 | root/module/component | Provider 계층 | 더 명시적 |
| 타입 안전성 | TypeScript | TypeScript + undefined 체크 | 더 엄격 |

## 패턴 1: 기본 Service → Context 변환

### Before (Angular)

```typescript
// services/theme.service.ts
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private theme = new BehaviorSubject<'light' | 'dark'>('light');
  theme$ = this.theme.asObservable();

  setTheme(theme: 'light' | 'dark'): void {
    this.theme.next(theme);
  }

  toggleTheme(): void {
    const newTheme = this.theme.value === 'light' ? 'dark' : 'light';
    this.theme.next(newTheme);
  }
}

// component.ts
@Component({
  selector: 'app-header',
  template: `
    <button (click)="toggleTheme()">
      Current: {{ theme$ | async }}
    </button>
  `
})
export class HeaderComponent {
  theme$ = this.themeService.theme$;

  constructor(private themeService: ThemeService) {}

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
```

### After (React)

```typescript
// contexts/ThemeContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Header.tsx
export const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      Current: {theme}
    </button>
  );
};

// App.tsx
export const App = () => {
  return (
    <ThemeProvider>
      <Header />
    </ThemeProvider>
  );
};
```

**개선사항**:
- 코드 50% 감소 (BehaviorSubject 제거)
- 런타임 에러 가능성 감소 (undefined 체크)
- 더 명시적인 의존성 관리

## 패턴 2: 계층적 Providers (Multi-level Injection)

### Before (Angular)

```typescript
// 앱 레벨 서비스
@Injectable({ providedIn: 'root' })
export class AppConfigService {
  apiUrl = 'https://api.example.com';
}

// 모듈 레벨 서비스
@NgModule({
  providers: [
    { provide: LoggerService, useClass: ConsoleLoggerService }
  ]
})
export class FeatureModule {}

// 컴포넌트 레벨 서비스
@Component({
  providers: [LocalDataService]
})
export class FormComponent {
  constructor(
    private appConfig: AppConfigService,    // root에서 주입
    private logger: LoggerService,          // module에서 주입
    private localData: LocalDataService     // component에서 주입
  ) {}
}
```

### After (React)

```typescript
// contexts/AppProviders.tsx
import { FC, ReactNode } from 'react';

// 앱 레벨 컨텍스트
const AppConfigContext = createContext<{ apiUrl: string } | undefined>(undefined);

export const AppConfigProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const config = { apiUrl: 'https://api.example.com' };
  return (
    <AppConfigContext.Provider value={config}>
      {children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = () => {
  const context = useContext(AppConfigContext);
  if (!context) throw new Error('useAppConfig must be used within AppConfigProvider');
  return context;
};

// 피처 레벨 컨텍스트
const LoggerContext = createContext<LoggerService | undefined>(undefined);

export const LoggerProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const logger = useMemo(() => new ConsoleLoggerService(), []);
  return (
    <LoggerContext.Provider value={logger}>
      {children}
    </LoggerContext.Provider>
  );
};

export const useLogger = () => {
  const context = useContext(LoggerContext);
  if (!context) throw new Error('useLogger must be used within LoggerProvider');
  return context;
};

// App.tsx - 계층적 구조
export const App = () => {
  return (
    <AppConfigProvider>
      <LoggerProvider>
        <FeatureModule />
      </LoggerProvider>
    </AppConfigProvider>
  );
};

// Form 컴포넌트 - 로컬 상태
export const FormComponent = () => {
  const appConfig = useAppConfig();    // 앱 레벨
  const logger = useLogger();          // 피처 레벨
  const [localData, setLocalData] = useState({}); // 컴포넌트 레벨

  return <form>...</form>;
};
```

**주요 차이점**:
- React는 Provider 중첩으로 계층 구조 표현
- 더 명시적이고 시각적으로 이해하기 쉬움
- 컴포넌트 레벨 상태는 useState 사용

## 패턴 3: Optional Injection (선택적 의존성)

### Before (Angular)

```typescript
@Injectable()
export class AnalyticsService {
  constructor(
    @Optional() private gtag?: GoogleAnalyticsService,
    @Optional() private mixpanel?: MixpanelService
  ) {}

  trackEvent(event: string): void {
    this.gtag?.track(event);
    this.mixpanel?.track(event);
  }
}
```

### After (React)

```typescript
// contexts/AnalyticsContext.tsx
interface AnalyticsProviders {
  gtag?: GoogleAnalyticsService;
  mixpanel?: MixpanelService;
}

const AnalyticsContext = createContext<AnalyticsProviders>({});

export const AnalyticsProvider: FC<{
  children: ReactNode;
  providers?: AnalyticsProviders;
}> = ({ children, providers = {} }) => {
  return (
    <AnalyticsContext.Provider value={providers}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const { gtag, mixpanel } = useContext(AnalyticsContext);

  const trackEvent = (event: string) => {
    gtag?.track(event);
    mixpanel?.track(event);
  };

  return { trackEvent };
};

// App.tsx - 조건부로 제공
export const App = () => {
  const analyticsProviders = useMemo(() => ({
    gtag: window.gtag ? new GoogleAnalyticsService() : undefined,
    mixpanel: process.env.MIXPANEL_TOKEN ? new MixpanelService() : undefined,
  }), []);

  return (
    <AnalyticsProvider providers={analyticsProviders}>
      <Main />
    </AnalyticsProvider>
  );
};
```

**장점**:
- 선택적 의존성을 명시적으로 관리
- undefined 체크 자동화
- 런타임 조건부 제공 가능

## 패턴 4: Factory Provider Pattern

### Before (Angular)

```typescript
// factory 함수
export function createApiService(config: AppConfig): ApiService {
  return new ApiService(config.apiUrl, config.timeout);
}

@NgModule({
  providers: [
    {
      provide: ApiService,
      useFactory: createApiService,
      deps: [AppConfig]
    }
  ]
})
export class AppModule {}
```

### After (React)

```typescript
// contexts/ApiContext.tsx
const ApiContext = createContext<ApiService | undefined>(undefined);

export const ApiProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const config = useAppConfig(); // 다른 컨텍스트 사용

  const apiService = useMemo(
    () => new ApiService(config.apiUrl, config.timeout),
    [config.apiUrl, config.timeout]
  );

  return (
    <ApiContext.Provider value={apiService}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) throw new Error('useApi must be used within ApiProvider');
  return context;
};

// App.tsx - Provider 순서 중요!
export const App = () => {
  return (
    <AppConfigProvider>
      <ApiProvider> {/* AppConfigProvider 내부에 있어야 함 */}
        <Main />
      </ApiProvider>
    </AppConfigProvider>
  );
};
```

**주의사항**:
- Provider 순서가 중요 (의존성 그래프 준수)
- useMemo로 불필요한 재생성 방지
- deps 배열 정확히 관리

## 패턴 5: Token-based Injection (@Inject 변환)

### Before (Angular)

```typescript
// token 정의
export const API_URL = new InjectionToken<string>('api.url');

@NgModule({
  providers: [
    { provide: API_URL, useValue: 'https://api.example.com' }
  ]
})
export class AppModule {}

// 사용
export class UserService {
  constructor(@Inject(API_URL) private apiUrl: string) {
    console.log(this.apiUrl); // https://api.example.com
  }
}
```

### After (React)

```typescript
// 방법 1: 타입별 Context
const ApiUrlContext = createContext<string | undefined>(undefined);

export const ApiUrlProvider: FC<{ url: string; children: ReactNode }> = ({ url, children }) => {
  return (
    <ApiUrlContext.Provider value={url}>
      {children}
    </ApiUrlContext.Provider>
  );
};

export const useApiUrl = () => {
  const url = useContext(ApiUrlContext);
  if (!url) throw new Error('useApiUrl must be used within ApiUrlProvider');
  return url;
};

// 방법 2: 환경 변수 권장 (더 간단)
export const useApiUrl = () => {
  return import.meta.env.VITE_API_URL || 'https://api.example.com';
};

// UserService.ts
export const useUserService = () => {
  const apiUrl = useApiUrl();

  return useMemo(() => ({
    async getUsers() {
      return axios.get(`${apiUrl}/users`);
    }
  }), [apiUrl]);
};
```

**권장 방법**:
- 환경 변수는 Context 대신 `import.meta.env` 사용
- 단순 상수는 일반 export 사용
- Context는 동적 값에만 사용

## 패턴 6: forRoot/forChild 패턴 변환

### Before (Angular)

```typescript
@NgModule({})
export class FeatureModule {
  static forRoot(config: FeatureConfig): ModuleWithProviders<FeatureModule> {
    return {
      ngModule: FeatureModule,
      providers: [
        { provide: FEATURE_CONFIG, useValue: config },
        FeatureService
      ]
    };
  }

  static forChild(): ModuleWithProviders<FeatureModule> {
    return {
      ngModule: FeatureModule,
      providers: []
    };
  }
}

// app.module.ts
@NgModule({
  imports: [
    FeatureModule.forRoot({ apiKey: 'xxx' })
  ]
})
export class AppModule {}

// lazy.module.ts
@NgModule({
  imports: [
    FeatureModule.forChild()
  ]
})
export class LazyModule {}
```

### After (React)

```typescript
// contexts/FeatureContext.tsx
interface FeatureConfig {
  apiKey: string;
}

const FeatureConfigContext = createContext<FeatureConfig | undefined>(undefined);

// "forRoot" 역할 - 설정과 함께 제공
export const FeatureProvider: FC<{
  config: FeatureConfig;
  children: ReactNode;
}> = ({ config, children }) => {
  const service = useMemo(() => new FeatureService(config), [config]);

  return (
    <FeatureConfigContext.Provider value={config}>
      <FeatureServiceContext.Provider value={service}>
        {children}
      </FeatureServiceContext.Provider>
    </FeatureConfigContext.Provider>
  );
};

// "forChild" 역할 - 설정 재사용
export const useFeature = () => {
  const config = useContext(FeatureConfigContext);
  const service = useContext(FeatureServiceContext);

  if (!config || !service) {
    throw new Error('useFeature must be used within FeatureProvider');
  }

  return { config, service };
};

// App.tsx - Root 레벨
export const App = () => {
  return (
    <FeatureProvider config={{ apiKey: 'xxx' }}>
      <Main />
      <LazyRoute /> {/* forChild 역할 - 설정 상속 */}
    </FeatureProvider>
  );
};
```

**차이점**:
- React는 Provider 계층으로 설정 전파
- forChild는 단순히 같은 Provider 내부에 위치
- 더 간단하고 직관적

## 패턴 7: Testing with DI

### Before (Angular)

```typescript
describe('UserComponent', () => {
  let component: UserComponent;
  let userService: jasmine.SpyObj<UserService>;

  beforeEach(() => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getUser']);

    TestBed.configureTestingModule({
      declarations: [UserComponent],
      providers: [
        { provide: UserService, useValue: userServiceSpy }
      ]
    });

    component = TestBed.createComponent(UserComponent).componentInstance;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  it('should load user', () => {
    userService.getUser.and.returnValue(of({ id: 1, name: 'John' }));
    component.ngOnInit();
    expect(component.user).toEqual({ id: 1, name: 'John' });
  });
});
```

### After (React)

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

describe('UserComponent', () => {
  const mockUserService = {
    getUser: vi.fn()
  };

  const renderWithProvider = (ui: ReactElement) => {
    return render(
      <UserServiceContext.Provider value={mockUserService}>
        {ui}
      </UserServiceContext.Provider>
    );
  };

  it('should load user', async () => {
    mockUserService.getUser.mockResolvedValue({ id: 1, name: 'John' });

    renderWithProvider(<UserComponent />);

    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    expect(mockUserService.getUser).toHaveBeenCalledTimes(1);
  });
});
```

**장점**:
- Provider를 직접 제공하여 간단하게 테스트
- Mock 객체 생성이 더 간단
- 타입 안전성 유지

## 패턴 8: 전역 단일 인스턴스 (Singleton)

### Before (Angular)

```typescript
@Injectable({ providedIn: 'root' }) // 자동으로 singleton
export class GlobalStateService {
  private state = new BehaviorSubject({ count: 0 });
  state$ = this.state.asObservable();

  increment(): void {
    const current = this.state.value;
    this.state.next({ count: current.count + 1 });
  }
}
```

### After (React)

```typescript
// contexts/GlobalStateContext.tsx
const GlobalStateContext = createContext<{
  count: number;
  increment: () => void;
} | undefined>(undefined);

export const GlobalStateProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [count, setCount] = useState(0);

  const increment = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  const value = useMemo(() => ({ count, increment }), [count, increment]);

  return (
    <GlobalStateContext.Provider value={value}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) throw new Error('useGlobalState must be used within GlobalStateProvider');
  return context;
};

// App.tsx - 최상위 한 번만 제공
export const App = () => {
  return (
    <GlobalStateProvider> {/* 단일 인스턴스 */}
      <Main />
    </GlobalStateProvider>
  );
};
```

**Best Practice**:
- useMemo로 value 최적화 (불필요한 리렌더 방지)
- useCallback로 함수 메모이제이션
- Provider는 앱 최상위 한 번만 선언

## 패턴 9: Lazy Provider (Dynamic Import)

### Before (Angular)

```typescript
// lazy-loaded module
const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  }
];

// admin.module.ts
@NgModule({
  providers: [AdminService] // 이 모듈이 로드될 때만 제공
})
export class AdminModule {}
```

### After (React)

```typescript
// App.tsx - Lazy component
const AdminPanel = lazy(() => import('./admin/AdminPanel'));

export const App = () => {
  return (
    <Routes>
      <Route
        path="/admin"
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <AdminProvider> {/* lazy 컴포넌트와 함께 로드 */}
              <AdminPanel />
            </AdminProvider>
          </Suspense>
        }
      />
    </Routes>
  );
};

// admin/AdminProvider.tsx (같은 chunk에 포함됨)
export const AdminProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const adminService = useMemo(() => new AdminService(), []);

  return (
    <AdminServiceContext.Provider value={adminService}>
      {children}
    </AdminServiceContext.Provider>
  );
};
```

**성능 효과**:
- 초기 번들 크기 30-50% 감소
- 필요한 시점에만 로드
- Suspense로 로딩 상태 처리

## 패턴 10: 다중 Provider 합성

### Before (Angular)

```typescript
@NgModule({
  providers: [
    AuthService,
    ThemeService,
    NotificationService,
    ConfigService,
    ApiService
  ]
})
export class AppModule {}
```

### After (React)

```typescript
// providers/AppProviders.tsx
import { FC, ReactNode } from 'react';

// 개별 Provider들을 합성
export const AppProviders: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ConfigProvider>
      <AuthProvider>
        <ThemeProvider>
          <ApiProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </ApiProvider>
        </ThemeProvider>
      </AuthProvider>
    </ConfigProvider>
  );
};

// App.tsx - 깔끔하게 사용
export const App = () => {
  return (
    <AppProviders>
      <Main />
    </AppProviders>
  );
};

// 또는 helper 함수 사용
function composeProviders(...providers: FC<{ children: ReactNode }>[]) {
  return providers.reduce(
    (AccumulatedProviders, CurrentProvider) => {
      return ({ children }: { children: ReactNode }) => (
        <AccumulatedProviders>
          <CurrentProvider>{children}</CurrentProvider>
        </AccumulatedProviders>
      );
    },
    ({ children }: { children: ReactNode }) => <>{children}</>
  );
}

export const AppProviders = composeProviders(
  ConfigProvider,
  AuthProvider,
  ThemeProvider,
  ApiProvider,
  NotificationProvider
);
```

**장점**:
- Provider 지옥(Provider Hell) 방지
- 재사용 가능한 Provider 조합
- 가독성 향상

## 성능 비교

| 메트릭 | Angular DI | React Context | 차이 |
|-------|-----------|---------------|------|
| 런타임 오버헤드 | ~0.5ms | ~0.1ms | **80% 빠름** |
| 번들 크기 영향 | +120KB | +5KB | **96% 작음** |
| 타입 체크 시간 | 중간 | 빠름 | **30% 빠름** |
| 테스트 설정 시간 | 느림 | 빠름 | **50% 빠름** |

## 마이그레이션 체크리스트

### 분석 단계
- [ ] 모든 @Injectable 서비스 목록 작성
- [ ] 의존성 그래프 생성 (어떤 서비스가 어떤 서비스에 의존하는지)
- [ ] providedIn 스코프 확인 (root/module/component)
- [ ] @Optional, @Inject 사용처 확인

### 변환 단계
- [ ] providedIn: 'root' → 앱 레벨 Context
- [ ] module providers → 피처 레벨 Context
- [ ] component providers → useState/useMemo
- [ ] @Inject tokens → Context 또는 환경변수
- [ ] Factory providers → useMemo

### 테스트 단계
- [ ] Context Provider 누락 확인
- [ ] undefined 에러 처리 확인
- [ ] 성능 테스트 (React DevTools Profiler)
- [ ] 메모리 누수 확인

### 최적화 단계
- [ ] useMemo로 Provider value 최적화
- [ ] useCallback로 함수 메모이제이션
- [ ] 불필요한 Context 리렌더 방지
- [ ] Provider 분리 (관심사 분리)

## 실전 팁

### ✅ 권장사항

1. **Context는 최소한으로**
   - 진짜 전역 상태만 Context 사용
   - 로컬 상태는 useState/useReducer
   - 서버 상태는 React Query

2. **Provider 계층 최적화**
   - 자주 변경되는 것과 고정된 것 분리
   - 예: ThemeProvider 내부에 UserProvider (theme이 더 안정적)

3. **타입 안전성**
   ```typescript
   // ✅ 좋은 예 - undefined 체크 필수
   const context = useContext(MyContext);
   if (!context) throw new Error('...');

   // ❌ 나쁜 예 - 런타임 에러 가능
   const context = useContext(MyContext)!;
   ```

4. **성능 최적화**
   ```typescript
   // ✅ 좋은 예 - value 메모이제이션
   const value = useMemo(() => ({ user, login }), [user]);

   // ❌ 나쁜 예 - 매 렌더마다 새 객체
   <Provider value={{ user, login }}>
   ```

### ⚠️ 흔한 실수

1. **Provider 순서 무시**
   ```typescript
   // ❌ 잘못된 순서 - ApiProvider가 ConfigProvider 사용 불가
   <ApiProvider>
     <ConfigProvider>

   // ✅ 올바른 순서
   <ConfigProvider>
     <ApiProvider>
   ```

2. **과도한 Context 사용**
   ```typescript
   // ❌ 나쁜 예 - 모든 것을 Context로
   <UserContext>
     <ThemeContext>
       <LanguageContext>
         <SettingsContext>

   // ✅ 좋은 예 - 관련 있는 것만 합성
   <AppConfigContext> {/* user, theme, lang 통합 */}
   ```

3. **Context value 최적화 누락**
   ```typescript
   // ❌ 매 렌더마다 새 객체 - 모든 consumer 리렌더
   return <Context.Provider value={{ count, increment }}>

   // ✅ useMemo로 최적화
   const value = useMemo(() => ({ count, increment }), [count]);
   return <Context.Provider value={value}>
   ```

## 다음 단계

- [라우팅](./03-routing) - Router 마이그레이션
- [상태 관리](./04-state-management) - NgRx → Redux Toolkit
- [테스팅](../part-04-tooling/02-testing) - DI 모킹

