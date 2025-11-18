---
title: 서비스를 Custom Hooks로 변환
description: Angular Injectable 서비스를 React Custom Hooks로 변환하는 방법
sidebar:
  order: 1
---

# 서비스를 Custom Hooks로 변환

Angular의 Injectable 서비스를 React의 Custom Hooks로 변환하는 완벽한 가이드입니다.

## 개요

**마이그레이션 난이도**: ⭐⭐⭐⭐ (고급)
**예상 소요 시간**: 1-2시간 (서비스 복잡도에 따라)

### 주요 변경사항

| 항목 | Angular | React |
|-----|---------|-------|
| 서비스 정의 | `@Injectable()` class | Custom Hook 함수 |
| 의존성 주입 | Constructor | Hook 내부에서 호출 |
| Singleton | `providedIn: 'root'` | Context + Provider |
| HTTP 요청 | RxJS Observable | React Query / Axios |

## Before (Angular)

```typescript
// user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`);
  }

  updateUser(id: number, data: Partial<User>): Observable<User> {
    return this.http.put<User>(`/api/users/${id}`, data);
  }

  setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }
}
```

```typescript
// component.ts
export class UserProfileComponent {
  user?: User;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUser(1).subscribe(user => {
      this.user = user;
    });
  }
}
```

## After (React 18+)

```typescript
// hooks/useUser.ts
import { useState, useCallback } from 'react';
import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
}

export const useUser = (userId?: number) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get<User>(`/api/users/${id}`);
      setUser(data);
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (id: number, updates: Partial<User>) => {
    setLoading(true);
    try {
      const { data } = await axios.put<User>(`/api/users/${id}`, updates);
      setUser(data);
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 자동으로 userId가 있으면 로드
  useEffect(() => {
    if (userId) {
      fetchUser(userId);
    }
  }, [userId, fetchUser]);

  return {
    user,
    loading,
    error,
    fetchUser,
    updateUser,
  };
};
```

```typescript
// Component.tsx
export const UserProfile: FC = () => {
  const { user, loading, error, fetchUser } = useUser(1);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return null;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
};
```

## React Query 사용 (권장)

```typescript
// hooks/useUser.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const fetchUser = async (id: number): Promise<User> => {
  const { data } = await axios.get(`/api/users/${id}`);
  return data;
};

export const useUser = (userId: number) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    enabled: !!userId,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> }) =>
      axios.put(`/api/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
  });

  return {
    user: query.data,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    updateUser: updateMutation.mutate,
  };
};
```

## 패턴 예제

(더 많은 예제와 패턴이 Phase 3에서 추가됩니다)

## 마이그레이션 체크리스트

- [ ] 서비스 메서드 분석
- [ ] Custom Hook 함수 생성
- [ ] 상태 관리 (`useState`)
- [ ] 비동기 로직 변환
- [ ] 에러 처리 추가
- [ ] 로딩 상태 추가
- [ ] React Query 고려

## 다음 단계

- [의존성 주입 대체](./02-dependency-injection)
- [상태 관리](./04-state-management)
