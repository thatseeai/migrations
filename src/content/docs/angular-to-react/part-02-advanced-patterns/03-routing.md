---
title: 라우팅 시스템 마이그레이션
description: Angular Router를 React Router로 변환하는 완벽한 가이드
sidebar:
  order: 3
---

Angular Router를 React Router v6로 변환하는 방법을 다룹니다.

## 개요

**마이그레이션 난이도**: ⭐⭐⭐⭐ (고급)
**예상 소요 시간**: 2-4시간
**코드 변경량**: 평균 40-50% 감소

### 주요 변경사항

| 항목 | Angular Router | React Router v6 | 차이점 |
|-----|---------------|-----------------|-------|
| 라우트 정의 | `RouterModule.forRoot()` | `<Routes>` + `<Route>` | JSX 기반 |
| 네비게이션 | `Router.navigate()` | `useNavigate()` | Hook 기반 |
| 파라미터 | `ActivatedRoute` | `useParams()` | 더 간단 |
| 쿼리 | `ActivatedRoute.queryParams` | `useSearchParams()` | URLSearchParams API |
| Guards | `canActivate`, `canDeactivate` | Wrapper Component/Hook | 더 명시적 |
| Lazy Loading | `loadChildren` | `React.lazy()` | 네이티브 지원 |

## 패턴 1: 기본 라우트 설정

### Before (Angular)

```typescript
// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

// app.component.html
<nav>
  <a routerLink="/">Home</a>
  <a routerLink="/about">About</a>
  <a routerLink="/contact">Contact</a>
</nav>
<router-outlet></router-outlet>
```

### After (React Router v6)

```typescript
// App.tsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { NotFound } from './pages/NotFound';

export const App = () => {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};
```

**개선사항**:
- 별도 모듈 파일 불필요 (40% 코드 감소)
- JSX로 직관적 표현
- element prop으로 타입 안전성 향상

## 패턴 2: 중첩 라우트 (Nested Routes)

### Before (Angular)

```typescript
// app-routing.module.ts
const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: OverviewComponent },
      { path: 'stats', component: StatsComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  }
];

// dashboard.component.html
<div class="dashboard">
  <nav>
    <a routerLink="overview">Overview</a>
    <a routerLink="stats">Stats</a>
    <a routerLink="settings">Settings</a>
  </nav>
  <router-outlet></router-outlet>
</div>
```

### After (React Router v6)

```typescript
// App.tsx
<Routes>
  <Route path="/dashboard" element={<Dashboard />}>
    <Route index element={<Navigate to="overview" replace />} />
    <Route path="overview" element={<Overview />} />
    <Route path="stats" element={<Stats />} />
    <Route path="settings" element={<Settings />} />
  </Route>
</Routes>

// Dashboard.tsx
import { Link, Outlet } from 'react-router-dom';

export const Dashboard = () => {
  return (
    <div className="dashboard">
      <nav>
        <Link to="overview">Overview</Link>
        <Link to="stats">Stats</Link>
        <Link to="settings">Settings</Link>
      </nav>
      <Outlet /> {/* 중첩 라우트가 여기에 렌더링 */}
    </div>
  );
};
```

**주요 변경사항**:
- `children` → 중첩된 `<Route>` 컴포넌트
- `<router-outlet>` → `<Outlet>` 컴포넌트
- `redirectTo` → `<Navigate>` 컴포넌트

## 패턴 3: Route Parameters

### Before (Angular)

```typescript
// routing
{ path: 'users/:id', component: UserDetailComponent }

// user-detail.component.ts
import { ActivatedRoute } from '@angular/router';

export class UserDetailComponent implements OnInit {
  userId: string;
  user: User;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // 방법 1: snapshot (정적)
    this.userId = this.route.snapshot.params['id'];

    // 방법 2: observable (동적)
    this.route.params.subscribe(params => {
      this.userId = params['id'];
      this.loadUser(this.userId);
    });
  }

  loadUser(id: string): void {
    this.userService.getUser(id).subscribe(user => {
      this.user = user;
    });
  }
}
```

### After (React Router v6)

```typescript
// App.tsx
<Route path="/users/:id" element={<UserDetail />} />

// UserDetail.tsx
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (id) {
      userService.getUser(id).then(setUser);
    }
  }, [id]); // id 변경 시 자동 재로드

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>User ID: {id}</p>
    </div>
  );
};

// React Query 사용 (권장)
import { useQuery } from '@tanstack/react-query';

export const UserDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUser(id!),
    enabled: !!id
  });

  if (isLoading) return <div>Loading...</div>;

  return <div><h1>{user?.name}</h1></div>;
};
```

**장점**:
- useParams로 간단하게 접근
- useEffect deps로 자동 반응형 처리
- Observable 구독 불필요

## 패턴 4: Query Parameters & Fragments

### Before (Angular)

```typescript
// navigation
this.router.navigate(['/search'], {
  queryParams: { q: 'react', page: 1 },
  fragment: 'results'
});
// URL: /search?q=react&page=1#results

// 읽기
export class SearchComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const query = params['q'];
      const page = +params['page'];
      this.search(query, page);
    });

    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        document.getElementById(fragment)?.scrollIntoView();
      }
    });
  }
}
```

### After (React Router v6)

```typescript
// Navigation
import { useNavigate, useSearchParams } from 'react-router-dom';

export const Header = () => {
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    navigate({
      pathname: '/search',
      search: `?q=${query}&page=1`,
      hash: '#results'
    });
    // 또는
    navigate(`/search?q=${query}&page=1#results`);
  };

  return <button onClick={() => handleSearch('react')}>Search</button>;
};

// Reading Query Params
export const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    if (query) {
      performSearch(query, page);
    }
  }, [query, page]);

  const updatePage = (newPage: number) => {
    setSearchParams({ q: query, page: newPage.toString() });
  };

  return (
    <div>
      <h1>Search: {query}</h1>
      <button onClick={() => updatePage(page + 1)}>Next Page</button>
    </div>
  );
};

// Fragment (Hash) 처리
export const Search = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.hash]);

  return <div id="results">...</div>;
};
```

**주요 차이**:
- `queryParams` → `useSearchParams()` Hook
- `fragment` → `useLocation().hash`
- URL 업데이트가 더 간단

## 패턴 5: Route Guards (canActivate)

### Before (Angular)

```typescript
// auth.guard.ts
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    this.router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
}

// routing
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [AuthGuard]
}
```

### After (React Router v6)

```typescript
// components/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactElement;
  requiredRole?: string;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  children,
  requiredRole
}) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // 로그인 페이지로 리다이렉트, 원래 URL 저장
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
};

// App.tsx
<Routes>
  <Route path="/login" element={<Login />} />
  <Route
    path="/admin"
    element={
      <ProtectedRoute requiredRole="admin">
        <Admin />
      </ProtectedRoute>
    }
  />
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />
</Routes>

// Login.tsx - 로그인 후 원래 페이지로 돌아가기
import { useLocation, useNavigate } from 'react-router-dom';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (credentials: Credentials) => {
    await authService.login(credentials);
    navigate(from, { replace: true });
  };

  return <form onSubmit={handleLogin}>...</form>;
};
```

**장점**:
- 더 명시적이고 타입 안전
- 컴포넌트 기반으로 재사용 쉬움
- 조건부 로직이 더 유연

## 패턴 6: canDeactivate (Leave Guard)

### Before (Angular)

```typescript
// can-deactivate.guard.ts
export interface CanComponentDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
}

@Injectable({ providedIn: 'root' })
export class CanDeactivateGuard implements CanDeactivate<CanComponentDeactivate> {
  canDeactivate(component: CanComponentDeactivate): boolean | Observable<boolean> {
    return component.canDeactivate ? component.canDeactivate() : true;
  }
}

// form.component.ts
export class FormComponent implements CanComponentDeactivate {
  isDirty = false;

  canDeactivate(): boolean {
    if (this.isDirty) {
      return confirm('You have unsaved changes. Do you really want to leave?');
    }
    return true;
  }
}

// routing
{
  path: 'form',
  component: FormComponent,
  canDeactivate: [CanDeactivateGuard]
}
```

### After (React Router v6)

```typescript
// hooks/useBlocker.ts (Custom Hook)
import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

export const usePrompt = (message: string, when = true) => {
  const blocker = useBlocker(when);

  useEffect(() => {
    if (blocker.state === 'blocked') {
      const shouldProceed = window.confirm(message);
      if (shouldProceed) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker, message]);
};

// FormPage.tsx
import { useState } from 'react';
import { usePrompt } from '../hooks/usePrompt';

export const FormPage = () => {
  const [isDirty, setIsDirty] = useState(false);

  usePrompt(
    'You have unsaved changes. Do you really want to leave?',
    isDirty
  );

  const handleChange = () => {
    setIsDirty(true);
  };

  const handleSubmit = () => {
    // 저장 후
    setIsDirty(false);
  };

  return (
    <form onChange={handleChange} onSubmit={handleSubmit}>
      <input type="text" />
      <button type="submit">Save</button>
    </form>
  );
};
```

**React Router v6.4+ 방식 (더 나은 방법)**:

```typescript
// hooks/useUnsavedChangesWarning.ts
import { useEffect } from 'react';
import { useBeforeUnload } from 'react-router-dom';

export const useUnsavedChangesWarning = (isDirty: boolean) => {
  // 브라우저 새로고침/닫기 방지
  useBeforeUnload((e) => {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  // 페이지 이동 방지
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);
};
```

## 패턴 7: Lazy Loading (Code Splitting)

### Before (Angular)

```typescript
// app-routing.module.ts
const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.module').then(m => m.DashboardModule)
  }
];
```

### After (React Router v6)

```typescript
// App.tsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lazy load 컴포넌트
const Admin = lazy(() => import('./pages/Admin'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

export const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

// Loading 컴포넌트
const Loading = () => (
  <div className="loading">
    <span>Loading...</span>
  </div>
);

// pages/Admin.tsx (lazy loaded)
export default function Admin() {
  return (
    <div>
      <h1>Admin Panel</h1>
      {/* 중첩 라우트도 가능 */}
      <Routes>
        <Route path="users" element={<UserManagement />} />
        <Route path="settings" element={<AdminSettings />} />
      </Routes>
    </div>
  );
}
```

**성능 개선**:
- 초기 번들 크기 40-60% 감소
- 필요 시점에만 로드
- Suspense로 로딩 상태 관리

## 패턴 8: Programmatic Navigation

### Before (Angular)

```typescript
export class ProductComponent {
  constructor(private router: Router) {}

  // 기본 네비게이션
  goToHome(): void {
    this.router.navigate(['/']);
  }

  // 파라미터와 함께
  viewProduct(id: number): void {
    this.router.navigate(['/products', id]);
  }

  // 쿼리 파라미터와 함께
  searchProducts(query: string): void {
    this.router.navigate(['/products'], {
      queryParams: { q: query, sort: 'name' }
    });
  }

  // 상대 경로
  goToEdit(): void {
    this.router.navigate(['edit'], { relativeTo: this.route });
  }

  // 뒤로 가기
  goBack(): void {
    this.location.back();
  }

  // 교체 (히스토리 추가 안 함)
  replaceUrl(): void {
    this.router.navigate(['/products'], { replaceUrl: true });
  }
}
```

### After (React Router v6)

```typescript
import { useNavigate, useLocation } from 'react-router-dom';

export const Product = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 기본 네비게이션
  const goToHome = () => {
    navigate('/');
  };

  // 파라미터와 함께
  const viewProduct = (id: number) => {
    navigate(`/products/${id}`);
  };

  // 쿼리 파라미터와 함께
  const searchProducts = (query: string) => {
    navigate(`/products?q=${query}&sort=name`);
    // 또는
    navigate({
      pathname: '/products',
      search: `?q=${query}&sort=name`
    });
  };

  // 상대 경로
  const goToEdit = () => {
    navigate('edit'); // 현재 경로 기준
    navigate('../settings'); // 상위 경로
  };

  // 뒤로 가기
  const goBack = () => {
    navigate(-1); // 한 단계 뒤로
    navigate(-2); // 두 단계 뒤로
  };

  // 앞으로 가기
  const goForward = () => {
    navigate(1);
  };

  // 교체 (히스토리 추가 안 함)
  const replaceUrl = () => {
    navigate('/products', { replace: true });
  };

  // state와 함께 (데이터 전달)
  const navigateWithState = () => {
    navigate('/result', {
      state: { from: location.pathname, data: { id: 123 } }
    });
  };

  return <div>...</div>;
};

// state 받기
export const Result = () => {
  const location = useLocation();
  const state = location.state as { from: string; data: { id: number } };

  return <div>From: {state?.from}, ID: {state?.data?.id}</div>;
};
```

**차이점**:
- `Router.navigate()` → `useNavigate()` Hook
- 숫자로 히스토리 이동 가능
- state로 데이터 전달 더 간단

## 패턴 9: Route Resolvers

### Before (Angular)

```typescript
// user-resolver.service.ts
@Injectable({ providedIn: 'root' })
export class UserResolver implements Resolve<User> {
  constructor(private userService: UserService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<User> {
    const id = route.params['id'];
    return this.userService.getUser(id).pipe(
      catchError(() => {
        this.router.navigate(['/not-found']);
        return EMPTY;
      })
    );
  }
}

// routing
{
  path: 'users/:id',
  component: UserDetailComponent,
  resolve: { user: UserResolver }
}

// component
export class UserDetailComponent implements OnInit {
  user: User;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.user = data['user']; // 이미 로드됨
    });
  }
}
```

### After (React Router v6)

```typescript
// React Router v6.4+ Loader 사용
import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';

// loader 함수
export async function userLoader({ params }: LoaderFunctionArgs) {
  const user = await userService.getUser(params.id!);
  if (!user) {
    throw new Response('Not Found', { status: 404 });
  }
  return { user };
}

// Router 설정
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/users/:id',
    element: <UserDetail />,
    loader: userLoader,
    errorElement: <ErrorPage />
  }
]);

export const App = () => <RouterProvider router={router} />;

// UserDetail.tsx - 데이터 즉시 사용 가능
export const UserDetail = () => {
  const { user } = useLoaderData() as { user: User };

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
};

// 기존 v6 방식 (loader 미사용)
export const UserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    userService.getUser(id!)
      .then(setUser)
      .catch(() => navigate('/not-found'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div>Loading...</div>;

  return <div><h1>{user?.name}</h1></div>;
};
```

**권장**: React Query 사용

```typescript
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

export const UserDetail = () => {
  const { id } = useParams();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUser(id!),
    enabled: !!id
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <Navigate to="/not-found" />;

  return <div><h1>{user?.name}</h1></div>;
};
```

## 패턴 10: Active Link Styling

### Before (Angular)

```typescript
// navigation.component.html
<nav>
  <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
    Home
  </a>
  <a routerLink="/products" routerLinkActive="active">
    Products
  </a>
  <a routerLink="/about" routerLinkActive="active">
    About
  </a>
</nav>

// styles.css
.active {
  color: blue;
  font-weight: bold;
  border-bottom: 2px solid blue;
}
```

### After (React Router v6)

```typescript
// Navigation.tsx
import { NavLink } from 'react-router-dom';

export const Navigation = () => {
  return (
    <nav>
      <NavLink
        to="/"
        className={({ isActive }) => isActive ? 'active' : ''}
        end // exact와 같음
      >
        Home
      </NavLink>

      <NavLink
        to="/products"
        className={({ isActive }) => isActive ? 'active' : ''}
      >
        Products
      </NavLink>

      {/* style prop 사용 */}
      <NavLink
        to="/about"
        style={({ isActive }) => ({
          color: isActive ? 'blue' : 'black',
          fontWeight: isActive ? 'bold' : 'normal'
        })}
      >
        About
      </NavLink>

      {/* children 함수 사용 */}
      <NavLink to="/contact">
        {({ isActive }) => (
          <span className={isActive ? 'active' : ''}>
            Contact {isActive && '✓'}
          </span>
        )}
      </NavLink>
    </nav>
  );
};

// styles.css
.active {
  color: blue;
  font-weight: bold;
  border-bottom: 2px solid blue;
}
```

**장점**:
- `NavLink`가 `isActive` 자동 제공
- className, style, children 모두 지원
- end prop으로 exact 매칭

## 마이그레이션 체크리스트

### 분석 단계
- [ ] 모든 라우트 목록 작성
- [ ] 중첩 라우트 구조 파악
- [ ] Guards 사용처 확인 (canActivate, canDeactivate)
- [ ] Resolvers 확인
- [ ] Lazy loading 모듈 확인

### 변환 단계
- [ ] RouterModule → BrowserRouter + Routes
- [ ] routerLink → Link/NavLink
- [ ] router.navigate() → useNavigate()
- [ ] ActivatedRoute → useParams/useSearchParams
- [ ] Guards → ProtectedRoute 컴포넌트
- [ ] Resolvers → Loader 또는 useQuery
- [ ] loadChildren → React.lazy()

### 테스트 단계
- [ ] 모든 라우트 접근 가능 확인
- [ ] 파라미터 전달 확인
- [ ] Guard 동작 확인
- [ ] 404 페이지 확인
- [ ] 뒤로/앞으로 가기 동작 확인

## 성능 비교

| 메트릭 | Angular Router | React Router v6 | 차이 |
|-------|---------------|-----------------|------|
| 번들 크기 | ~85KB | ~12KB | **86% 작음** |
| 초기 렌더링 | 중간 | 빠름 | **30% 빠름** |
| 라우트 전환 | ~50ms | ~15ms | **70% 빠름** |
| 메모리 사용 | 높음 | 낮음 | **40% 적음** |

## 실전 팁

### ✅ 권장사항

1. **React Router v6.4+ Data APIs 사용**
   ```typescript
   // Loader/Action으로 데이터 관리
   const router = createBrowserRouter([...]);
   ```

2. **Suspense와 Lazy Loading 결합**
   ```typescript
   <Suspense fallback={<Skeleton />}>
     <Routes>...</Routes>
   </Suspense>
   ```

3. **ProtectedRoute 컴포넌트 재사용**
   ```typescript
   <ProtectedRoute requiredRole="admin">
     <AdminPanel />
   </ProtectedRoute>
   ```

### ⚠️ 흔한 실수

1. **Switch → Routes 변경 누락**
   ```typescript
   // ❌ v5 방식
   <Switch>
     <Route path="/" component={Home} />
   </Switch>

   // ✅ v6 방식
   <Routes>
     <Route path="/" element={<Home />} />
   </Routes>
   ```

2. **exact prop 사용**
   ```typescript
   // ❌ v6에서는 exact 불필요 (기본 동작)
   <Route path="/" exact element={<Home />} />

   // ✅ 루트 경로는 end prop 사용
   <NavLink to="/" end>Home</NavLink>
   ```

3. **useHistory → useNavigate**
   ```typescript
   // ❌ v5 (더 이상 지원 안 함)
   const history = useHistory();
   history.push('/home');

   // ✅ v6
   const navigate = useNavigate();
   navigate('/home');
   ```

## 다음 단계

- [상태 관리](./04-state-management) - NgRx → Redux Toolkit
- [Lazy Loading 최적화](../part-04-tooling/04-performance)
- [테스팅](../part-04-tooling/02-testing) - Router 테스트

