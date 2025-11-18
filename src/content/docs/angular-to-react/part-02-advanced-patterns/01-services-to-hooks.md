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
**코드 변경량**: 평균 40% 감소

### 주요 변경사항

| 항목 | Angular | React |
|-----|---------|-------|
| 서비스 정의 | `@Injectable()` class | Custom Hook 함수 |
| 의존성 주입 | Constructor | Hook 내부에서 호출 |
| Singleton | `providedIn: 'root'` | Context + Provider |
| HTTP 요청 | RxJS Observable | React Query / Axios |
| 상태 공유 | BehaviorSubject | Context API |

## 변환 패턴 15가지

### 1. 기본 HTTP 서비스

**Angular**
```typescript
// user.service.ts
@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`);
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }
}
```

**React**
```typescript
// hooks/useUsers.ts
import axios from 'axios';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/users');
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  return { users, loading, fetchUsers };
};
```

### 2. React Query 버전 (권장)

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await axios.get('/api/users');
      return data;
    },
  });
};

export const useUser = (id: number) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const { data } = await axios.get(`/api/users/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> }) =>
      axios.put(`/api/users/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
```

### 3. 인증 서비스

**Angular**
```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  login(credentials: Credentials): Observable<User> {
    return this.http.post<User>('/api/login', credentials).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }
}
```

**React**
```typescript
import { createContext, useContext, useState } from 'react';

interface AuthContextType {
  user: User | null;
  login: (credentials: Credentials) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (credentials: Credentials) => {
    const { data } = await axios.post('/api/login', credentials);
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    localStorage.setItem('token', data.token);
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### 4. 로컬 스토리지 서비스

**Angular**
```typescript
@Injectable({ providedIn: 'root' })
export class StorageService {
  set(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  get<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }
}
```

**React**
```typescript
export const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setStoredValue = (newValue: T | ((val: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  const removeValue = () => {
    try {
      localStorage.removeItem(key);
      setValue(initialValue);
    } catch (error) {
      console.error(error);
    }
  };

  return [value, setStoredValue, removeValue] as const;
};

// 사용 예
const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');
```

### 5. WebSocket 서비스

**Angular**
```typescript
@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket$: WebSocketSubject<any>;

  connect(url: string): Observable<any> {
    this.socket$ = webSocket(url);
    return this.socket$.asObservable();
  }

  send(data: any): void {
    this.socket$.next(data);
  }

  close(): void {
    this.socket$.complete();
  }
}
```

**React**
```typescript
export const useWebSocket = (url: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prev => [...prev, data]);
    };

    wsRef.current = ws;

    return () => ws.close();
  }, [url]);

  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { messages, isConnected, send };
};
```

### 6. 폼 검증 서비스

**Angular**
```typescript
@Injectable({ providedIn: 'root' })
export class ValidationService {
  validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (password.length < 8) errors.push('최소 8자');
    if (!/[A-Z]/.test(password)) errors.push('대문자 포함');
    if (!/[0-9]/.test(password)) errors.push('숫자 포함');
    return { valid: errors.length === 0, errors };
  }
}
```

**React**
```typescript
export const useValidation = () => {
  const validateEmail = useCallback((email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, []);

  const validatePassword = useCallback((password: string) => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('최소 8자');
    if (!/[A-Z]/.test(password)) errors.push('대문자 포함');
    if (!/[0-9]/.test(password)) errors.push('숫자 포함');
    return { valid: errors.length === 0, errors };
  }, []);

  return { validateEmail, validatePassword };
};

// 또는 React Hook Form + Zod 사용 (권장)
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  email: z.string().email('유효한 이메일을 입력하세요'),
  password: z.string()
    .min(8, '최소 8자')
    .regex(/[A-Z]/, '대문자 포함')
    .regex(/[0-9]/, '숫자 포함'),
});

export const useLoginForm = () => {
  return useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });
};
```

### 7. 타이머/인터벌 서비스

**Angular**
```typescript
@Injectable({ providedIn: 'root' })
export class TimerService {
  startTimer(callback: () => void, interval: number): number {
    return window.setInterval(callback, interval);
  }

  stopTimer(id: number): void {
    window.clearInterval(id);
  }
}
```

**React**
```typescript
export const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
};

// 사용 예
const [count, setCount] = useState(0);
useInterval(() => setCount(c => c + 1), 1000);
```

### 8. 알림 서비스

**Angular**
```typescript
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notifications$ = new Subject<Notification>();

  show(message: string, type: 'success' | 'error' | 'info'): void {
    this.notifications$.next({ message, type });
  }

  getNotifications(): Observable<Notification> {
    return this.notifications$.asObservable();
  }
}
```

**React**
```typescript
interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const NotificationContext = createContext<{
  notifications: Notification[];
  show: (message: string, type: Notification['type']) => void;
  remove: (id: string) => void;
} | undefined>(undefined);

export const NotificationProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const show = useCallback((message: string, type: Notification['type']) => {
    const id = Math.random().toString(36);
    setNotifications(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  const remove = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, show, remove }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};
```

### 9. 페이지네이션 서비스

**Angular**
```typescript
@Injectable({ providedIn: 'root' })
export class PaginationService {
  paginate<T>(items: T[], page: number, pageSize: number) {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return {
      items: items.slice(startIndex, endIndex),
      totalPages: Math.ceil(items.length / pageSize),
      currentPage: page,
    };
  }
}
```

**React**
```typescript
export const usePagination = <T,>(items: T[], pageSize: number = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentItems = items.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  return {
    currentItems,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  };
};
```

### 10. 파일 업로드 서비스

**Angular**
```typescript
@Injectable({ providedIn: 'root' })
export class FileUploadService {
  upload(file: File): Observable<UploadProgress> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<any>('/api/upload', formData, {
      reportProgress: true,
      observe: 'events',
    }).pipe(
      map(event => this.getProgress(event))
    );
  }
}
```

**React**
```typescript
export const useFileUpload = () => {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setProgress(percentCompleted);
        },
      });
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { upload, progress, uploading, error };
};
```

### 11. 검색/필터 서비스

**Angular**
```typescript
@Injectable({ providedIn: 'root' })
export class SearchService {
  search<T>(items: T[], query: string, fields: (keyof T)[]): T[] {
    const lowerQuery = query.toLowerCase();
    return items.filter(item =>
      fields.some(field =>
        String(item[field]).toLowerCase().includes(lowerQuery)
      )
    );
  }
}
```

**React**
```typescript
export const useSearch = <T,>(items: T[], fields: (keyof T)[]) => {
  const [query, setQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!query) return items;

    const lowerQuery = query.toLowerCase();
    return items.filter(item =>
      fields.some(field =>
        String(item[field]).toLowerCase().includes(lowerQuery)
      )
    );
  }, [items, query, fields]);

  return { query, setQuery, filteredItems };
};

// 사용 예
const { query, setQuery, filteredItems } = useSearch(users, ['name', 'email']);
```

### 12. 디바운스 서비스

**Angular**
```typescript
@Injectable({ providedIn: 'root' })
export class DebounceService {
  debounce<T>(func: (...args: any[]) => T, wait: number) {
    let timeout: number;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => func(...args), wait);
    };
  }
}
```

**React**
```typescript
export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// 사용 예
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearchTerm = useDebounce(searchTerm, 500);

useEffect(() => {
  if (debouncedSearchTerm) {
    searchAPI(debouncedSearchTerm);
  }
}, [debouncedSearchTerm]);
```

### 13. 권한 서비스

**Angular**
```typescript
@Injectable({ providedIn: 'root' })
export class PermissionService {
  private permissions$ = new BehaviorSubject<string[]>([]);

  hasPermission(permission: string): boolean {
    return this.permissions$.value.includes(permission);
  }

  hasRole(role: string): boolean {
    return this.permissions$.value.includes(`role:${role}`);
  }
}
```

**React**
```typescript
const PermissionContext = createContext<{
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
} | undefined>(undefined);

export const PermissionProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [permissions, setPermissions] = useState<string[]>([]);

  const hasPermission = useCallback(
    (permission: string) => permissions.includes(permission),
    [permissions]
  );

  const hasRole = useCallback(
    (role: string) => permissions.includes(`role:${role}`),
    [permissions]
  );

  return (
    <PermissionContext.Provider value={{ permissions, hasPermission, hasRole }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermission = () => {
  const context = useContext(PermissionContext);
  if (!context) throw new Error('usePermission must be used within PermissionProvider');
  return context;
};
```

### 14. 캐시 서비스

**Angular**
```typescript
@Injectable({ providedIn: 'root' })
export class CacheService {
  private cache = new Map<string, { data: any; timestamp: number }>();

  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, { data, timestamp: Date.now() + ttl });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.timestamp) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }
}
```

**React (React Query를 사용하는 것이 더 좋음)**
```typescript
export const useCache = <T,>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000
) => {
  return useQuery({
    queryKey: [key],
    queryFn: fetcher,
    staleTime: ttl,
    cacheTime: ttl,
  });
};
```

### 15. 로깅 서비스

**Angular**
```typescript
@Injectable({ providedIn: 'root' })
export class LoggerService {
  log(message: string, ...args: any[]): void {
    console.log(`[LOG] ${message}`, ...args);
  }

  error(message: string, error?: any): void {
    console.error(`[ERROR] ${message}`, error);
    // 서버로 전송
    this.sendToServer('error', message, error);
  }
}
```

**React**
```typescript
export const useLogger = () => {
  const log = useCallback((message: string, ...args: any[]) => {
    console.log(`[LOG] ${message}`, ...args);
  }, []);

  const error = useCallback((message: string, err?: any) => {
    console.error(`[ERROR] ${message}`, err);
    // 서버로 전송 (예: Sentry)
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(err);
    }
  }, []);

  const warn = useCallback((message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  }, []);

  return { log, error, warn };
};
```

## 마이그레이션 체크리스트

- [ ] 서비스 메서드 목록 작성
- [ ] Singleton 여부 확인
- [ ] RxJS Observable 사용 여부
- [ ] HTTP 요청 패턴 분석
- [ ] 상태 공유 필요성 확인
- [ ] Custom Hook 또는 Context 결정
- [ ] React Query 도입 검토
- [ ] 에러 처리 로직 추가
- [ ] 로딩 상태 관리
- [ ] 타입 정의 완성

## 실전 팁

### React Query 사용 시 장점

- 자동 캐싱 및 리페칭
- 백그라운드 업데이트
- 낙관적 업데이트(Optimistic Updates)
- 자동 에러 재시도
- 코드 40-60% 감소

### 성능 비교

| 패턴 | 코드량 | 성능 | 유지보수 |
|-----|--------|------|----------|
| 수동 useState | 100% | 보통 | 어려움 |
| Custom Hook | 70% | 좋음 | 보통 |
| React Query | 40% | 매우 좋음 | 쉬움 |

## 다음 단계

- [의존성 주입 대체](./02-dependency-injection)
- [상태 관리](./04-state-management)
- [라우팅](./03-routing)
