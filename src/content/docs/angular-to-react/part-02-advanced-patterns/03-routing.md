---
title: 라우팅 시스템 마이그레이션
description: Angular Router를 React Router로 변환하는 완벽한 가이드
sidebar:
  order: 3
---

# 라우팅 시스템 마이그레이션

Angular Router를 React Router v6로 변환하는 방법을 다룹니다.

## 개요

**마이그레이션 난이도**: ⭐⭐⭐⭐ (고급)
**예상 소요 시간**: 2-4시간

### 주요 변경사항

| 항목 | Angular | React Router |
|-----|---------|--------------|
| 라우트 정의 | `RouterModule.forRoot()` | `<Routes>` + `<Route>` |
| 네비게이션 | `Router.navigate()` | `useNavigate()` |
| 파라미터 | `ActivatedRoute` | `useParams()` |
| 쿼리 | `ActivatedRoute.queryParams` | `useSearchParams()` |
| Guards | `canActivate` | Wrapper Component |

## Before (Angular)

```typescript
// app-routing.module.ts
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'users/:id', component: UserDetailComponent },
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

// component.ts
export class UserDetailComponent {
  userId: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.userId = this.route.snapshot.params['id'];
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
```

## After (React 18+ with React Router v6)

```typescript
// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/users/:id" element={<UserDetail />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

// UserDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';

export const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const goBack = () => {
    navigate('/users');
  };

  return (
    <div>
      <h1>User {id}</h1>
      <button onClick={goBack}>Back</button>
    </div>
  );
};
```

## 패턴 예제

(더 많은 예제와 패턴이 Phase 3에서 추가됩니다)

## 마이그레이션 체크리스트

- [ ] React Router 설치
- [ ] 라우트 정의 변환
- [ ] 네비게이션 로직 변환
- [ ] Route Guards → Protected Route
- [ ] Lazy Loading 설정
- [ ] 파라미터/쿼리 처리

## 다음 단계

- [상태 관리](./04-state-management)
- [Lazy Loading](../part-04-tooling/04-performance)
