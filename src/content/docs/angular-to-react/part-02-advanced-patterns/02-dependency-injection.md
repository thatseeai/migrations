---
title: 의존성 주입 대체 패턴
description: Angular DI 시스템을 React Context API와 Props로 대체하는 방법
sidebar:
  order: 2
---

# 의존성 주입 대체 패턴

Angular의 의존성 주입(DI) 시스템을 React의 Context API와 Props로 대체하는 방법을 다룹니다.

## 개요

**마이그레이션 난이도**: ⭐⭐⭐⭐ (고급)
**예상 소요 시간**: 2-3시간

### 주요 변경사항

| 항목 | Angular | React |
|-----|---------|-------|
| 의존성 주입 | DI Container | Context API / Props |
| 제공자 | `providers: []` | `<Provider>` 컴포넌트 |
| 주입 | `constructor()` | `useContext()` Hook |

## Before (Angular)

```typescript
// auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private user = new BehaviorSubject<User | null>(null);

  login(credentials: Credentials): Observable<User> {
    return this.http.post<User>('/api/login', credentials);
  }

  logout(): void {
    this.user.next(null);
  }

  get currentUser(): User | null {
    return this.user.value;
  }
}

// component.ts
export class ProfileComponent {
  constructor(private authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}
```

## After (React 18+)

```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  user: User | null;
  login: (credentials: Credentials) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (credentials: Credentials) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    const userData = await response.json();
    setUser(userData);
    return userData;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Component.tsx
export const Profile = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>{user?.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

## 패턴 예제

(더 많은 예제와 패턴이 Phase 3에서 추가됩니다)

## 마이그레이션 체크리스트

- [ ] 서비스 → Context 변환
- [ ] Provider 컴포넌트 생성
- [ ] useContext Hook 생성
- [ ] App에 Provider 추가
- [ ] DI 제거 및 Hook 사용

## 다음 단계

- [라우팅](./03-routing)
- [상태 관리](./04-state-management)
