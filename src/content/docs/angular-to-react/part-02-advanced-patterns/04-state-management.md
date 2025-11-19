---
title: 상태 관리 마이그레이션
description: NgRx/RxJS를 Redux Toolkit/React Query로 변환하는 방법
sidebar:
  order: 4
---

NgRx를 Redux Toolkit으로, RxJS를 React Query로 변환하는 방법을 다룹니다.

## 개요

**마이그레이션 난이도**: ⭐⭐⭐⭐⭐ (매우 고급)
**예상 소요 시간**: 4-8시간
**코드 변경량**: 평균 60-70% 감소

### 주요 변경사항

| 항목 | Angular (NgRx/RxJS) | React | 코드 감소율 |
|-----|-------------------|-------|-----------|
| 글로벌 상태 | NgRx Store | Redux Toolkit | **60%** |
| 비동기 상태 | RxJS + Effects | React Query | **80%** |
| 액션 | createAction + Effects | createAsyncThunk | **70%** |
| Selector | createSelector | useSelector + reselect | **40%** |
| 미들웨어 | Effects | Thunk (내장) | **90%** |

## 패턴 1: 기본 NgRx → Redux Toolkit

### Before (Angular + NgRx)

```typescript
// state/counter/counter.actions.ts
import { createAction, props } from '@ngrx/store';

export const increment = createAction('[Counter] Increment');
export const decrement = createAction('[Counter] Decrement');
export const reset = createAction('[Counter] Reset');
export const set = createAction(
  '[Counter] Set',
  props<{ value: number }>()
);

// state/counter/counter.reducer.ts
import { createReducer, on } from '@ngrx/store';

export interface CounterState {
  count: number;
}

const initialState: CounterState = {
  count: 0
};

export const counterReducer = createReducer(
  initialState,
  on(increment, state => ({ count: state.count + 1 })),
  on(decrement, state => ({ count: state.count - 1 })),
  on(reset, () => initialState),
  on(set, (state, { value }) => ({ count: value }))
);

// state/counter/counter.selectors.ts
import { createSelector } from '@ngrx/store';

export const selectCount = (state: AppState) => state.counter.count;
export const selectDoubleCount = createSelector(
  selectCount,
  count => count * 2
);

// component.ts
export class CounterComponent {
  count$ = this.store.select(selectCount);
  doubleCount$ = this.store.select(selectDoubleCount);

  constructor(private store: Store<AppState>) {}

  increment(): void {
    this.store.dispatch(increment());
  }

  decrement(): void {
    this.store.dispatch(decrement());
  }
}
```

### After (React + Redux Toolkit)

```typescript
// store/counterSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CounterState {
  count: number;
}

const initialState: CounterState = {
  count: 0
};

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.count += 1; // Immer로 불변성 자동 처리
    },
    decrement: (state) => {
      state.count -= 1;
    },
    reset: () => initialState,
    set: (state, action: PayloadAction<number>) => {
      state.count = action.payload;
    }
  }
});

export const { increment, decrement, reset, set } = counterSlice.actions;
export default counterSlice.reducer;

// Selectors
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './store';

export const selectCount = (state: RootState) => state.counter.count;
export const selectDoubleCount = createSelector(
  selectCount,
  (count) => count * 2
);

// Counter.tsx
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement, selectCount, selectDoubleCount } from './counterSlice';

export const Counter = () => {
  const count = useSelector(selectCount);
  const doubleCount = useSelector(selectDoubleCount);
  const dispatch = useDispatch();

  return (
    <div>
      <p>Count: {count}</p>
      <p>Double: {doubleCount}</p>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
    </div>
  );
};
```

**개선사항**:
- 액션, 리듀서가 하나의 slice로 통합 (3개 파일 → 1개)
- Immer로 불변성 자동 관리
- 타입스크립트 타입 자동 추론

## 패턴 2: 비동기 처리 (NgRx Effects → createAsyncThunk)

### Before (Angular + NgRx Effects)

```typescript
// user.actions.ts
export const loadUsers = createAction('[User] Load Users');
export const loadUsersSuccess = createAction(
  '[User] Load Users Success',
  props<{ users: User[] }>()
);
export const loadUsersFailure = createAction(
  '[User] Load Users Failure',
  props<{ error: string }>()
);

// user.effects.ts
@Injectable()
export class UserEffects {
  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadUsers),
      switchMap(() =>
        this.userService.getUsers().pipe(
          map(users => loadUsersSuccess({ users })),
          catchError(error => of(loadUsersFailure({ error: error.message })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private userService: UserService
  ) {}
}

// user.reducer.ts
const userReducer = createReducer(
  initialState,
  on(loadUsers, state => ({ ...state, loading: true })),
  on(loadUsersSuccess, (state, { users }) => ({
    ...state,
    users,
    loading: false,
    error: null
  })),
  on(loadUsersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);

// component.ts
export class UserListComponent implements OnInit {
  users$ = this.store.select(selectUsers);
  loading$ = this.store.select(selectLoading);

  ngOnInit(): void {
    this.store.dispatch(loadUsers());
  }
}
```

### After (React + Redux Toolkit)

```typescript
// store/userSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null
};

// Async Thunk - 자동으로 pending/fulfilled/rejected 액션 생성
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getUsers();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
        state.loading = false;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export default userSlice.reducer;

// UserList.tsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from './userSlice';

export const UserList = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state: RootState) => state.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};
```

**개선사항**:
- Effects 파일 불필요 (30% 코드 감소)
- pending/fulfilled/rejected 자동 생성
- 에러 처리 간소화

## 패턴 3: React Query 사용 (권장)

### After (React Query - 더 간단)

```typescript
// services/userService.ts
import axios from 'axios';

export const userService = {
  getUsers: async (): Promise<User[]> => {
    const { data } = await axios.get('/api/users');
    return data;
  },

  getUser: async (id: string): Promise<User> => {
    const { data } = await axios.get(`/api/users/${id}`);
    return data;
  },

  createUser: async (user: CreateUserDto): Promise<User> => {
    const { data } = await axios.post('/api/users', user);
    return data;
  }
};

// UserList.tsx
import { useQuery } from '@tanstack/react-query';

export const UserList = () => {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getUsers,
    staleTime: 5 * 60 * 1000, // 5분간 fresh 유지
    gcTime: 10 * 60 * 1000 // 10분간 캐시 유지
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {users?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};

// 자동 리페칭, 캐싱, 에러 처리 모두 내장!
```

**React Query 장점**:
- 코드 80% 감소
- 자동 캐싱 및 재검증
- 백그라운드 리페칭
- Optimistic updates 쉬움
- DevTools 내장

## 패턴 4: Mutations (생성/수정/삭제)

### Before (NgRx Effects)

```typescript
// user.actions.ts
export const createUser = createAction(
  '[User] Create User',
  props<{ user: CreateUserDto }>()
);
export const createUserSuccess = createAction(
  '[User] Create User Success',
  props<{ user: User }>()
);
export const createUserFailure = createAction(
  '[User] Create User Failure',
  props<{ error: string }>()
);

// user.effects.ts
createUser$ = createEffect(() =>
  this.actions$.pipe(
    ofType(createUser),
    switchMap(({ user }) =>
      this.userService.createUser(user).pipe(
        map(newUser => createUserSuccess({ user: newUser })),
        catchError(error => of(createUserFailure({ error: error.message })))
      )
    )
  )
);

// user.reducer.ts
on(createUserSuccess, (state, { user }) => ({
  ...state,
  users: [...state.users, user]
}))
```

### After (React Query)

```typescript
// UserForm.tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const UserForm = () => {
  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: (newUser) => {
      // 캐시 무효화 (자동 리페칭)
      queryClient.invalidateQueries({ queryKey: ['users'] });

      // 또는 직접 캐시 업데이트 (낙관적 업데이트)
      queryClient.setQueryData<User[]>(['users'], (old) =>
        old ? [...old, newUser] : [newUser]
      );
    },
    onError: (error) => {
      console.error('Failed to create user:', error);
    }
  });

  const handleSubmit = (formData: CreateUserDto) => {
    createUserMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="name" />
      <button type="submit" disabled={createUserMutation.isPending}>
        {createUserMutation.isPending ? 'Creating...' : 'Create User'}
      </button>
      {createUserMutation.isError && (
        <div>Error: {createUserMutation.error.message}</div>
      )}
    </form>
  );
};
```

**장점**:
- 낙관적 업데이트 쉬움
- 자동 캐시 무효화
- 로딩/에러 상태 자동 관리

## 패턴 5: Entity Adapter 패턴

### Before (NgRx EntityAdapter)

```typescript
// user.reducer.ts
import { createEntityAdapter, EntityState } from '@ngrx/entity';

export interface UserState extends EntityState<User> {
  selectedUserId: string | null;
  loading: boolean;
}

export const userAdapter = createEntityAdapter<User>();

const initialState: UserState = userAdapter.getInitialState({
  selectedUserId: null,
  loading: false
});

export const userReducer = createReducer(
  initialState,
  on(loadUsersSuccess, (state, { users }) =>
    userAdapter.setAll(users, state)
  ),
  on(createUserSuccess, (state, { user }) =>
    userAdapter.addOne(user, state)
  ),
  on(updateUserSuccess, (state, { user }) =>
    userAdapter.updateOne({ id: user.id, changes: user }, state)
  ),
  on(deleteUserSuccess, (state, { id }) =>
    userAdapter.removeOne(id, state)
  )
);

// selectors
export const {
  selectAll,
  selectEntities,
  selectIds,
  selectTotal
} = userAdapter.getSelectors();
```

### After (Redux Toolkit EntityAdapter)

```typescript
// store/userSlice.ts
import { createSlice, createEntityAdapter, createAsyncThunk } from '@reduxjs/toolkit';

const userAdapter = createEntityAdapter<User>({
  selectId: (user) => user.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name)
});

const initialState = userAdapter.getInitialState({
  loading: false,
  error: null
});

export const fetchUsers = createAsyncThunk('users/fetchAll', async () => {
  return await userService.getUsers();
});

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    userAdded: userAdapter.addOne,
    userUpdated: userAdapter.updateOne,
    userRemoved: userAdapter.removeOne
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.fulfilled, (state, action) => {
        userAdapter.setAll(state, action.payload);
      });
  }
});

// Selectors
export const {
  selectAll: selectAllUsers,
  selectById: selectUserById,
  selectIds: selectUserIds
} = userAdapter.getSelectors((state: RootState) => state.users);

export default userSlice.reducer;
```

**React Query 방식 (더 간단)**:

```typescript
// hooks/useUsers.ts
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: userService.getUsers,
    select: (data) => {
      // 정규화는 필요 시에만
      const byId = data.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {} as Record<string, User>);

      return { byId, allIds: data.map(u => u.id) };
    }
  });
};
```

## 패턴 6: RxJS Observables → React Query

### Before (RxJS)

```typescript
// user.service.ts
@Injectable({ providedIn: 'root' })
export class UserService {
  private usersSubject = new BehaviorSubject<User[]>([]);
  users$ = this.usersSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUsers();

    // 30초마다 자동 갱신
    interval(30000).subscribe(() => this.loadUsers());
  }

  loadUsers(): void {
    this.http.get<User[]>('/api/users')
      .pipe(
        retry(3),
        catchError(() => of([]))
      )
      .subscribe(users => this.usersSubject.next(users));
  }

  searchUsers(query: string): Observable<User[]> {
    return this.http.get<User[]>(`/api/users/search?q=${query}`).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => this.http.get<User[]>(`/api/users/search?q=${q}`))
    );
  }
}

// component.ts
export class UserListComponent {
  users$ = this.userService.users$;
  searchResults$ = this.searchControl.valueChanges.pipe(
    debounceTime(300),
    switchMap(query => this.userService.searchUsers(query))
  );
}
```

### After (React Query)

```typescript
// hooks/useUsers.ts
import { useQuery } from '@tanstack/react-query';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: userService.getUsers,
    retry: 3, // 3번 재시도
    refetchInterval: 30000, // 30초마다 자동 갱신
    refetchOnWindowFocus: true // 창 포커스 시 갱신
  });
};

// hooks/useUserSearch.ts
import { useDeferredValue } from 'react';

export const useUserSearch = (query: string) => {
  const deferredQuery = useDeferredValue(query); // 디바운스 효과

  return useQuery({
    queryKey: ['users', 'search', deferredQuery],
    queryFn: () => userService.searchUsers(deferredQuery),
    enabled: deferredQuery.length >= 2, // 2글자 이상일 때만
    staleTime: 5 * 60 * 1000 // 5분간 캐시 유지
  });
};

// UserSearch.tsx
export const UserSearch = () => {
  const [query, setQuery] = useState('');
  const { data: users, isLoading } = useUserSearch(query);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users..."
      />
      {isLoading && <div>Searching...</div>}
      {users?.map(user => <div key={user.id}>{user.name}</div>)}
    </div>
  );
};
```

**개선사항**:
- BehaviorSubject 불필요
- interval 불필요 (refetchInterval 사용)
- debounceTime → useDeferredValue
- 코드 70% 감소

## 패턴 7: 복잡한 Selector 체인

### Before (NgRx)

```typescript
// selectors.ts
export const selectUserState = (state: AppState) => state.users;
export const selectAllUsers = createSelector(
  selectUserState,
  state => state.users
);
export const selectActiveUsers = createSelector(
  selectAllUsers,
  users => users.filter(u => u.isActive)
);
export const selectUsersByRole = (role: string) => createSelector(
  selectAllUsers,
  users => users.filter(u => u.role === role)
);
export const selectUserStats = createSelector(
  selectAllUsers,
  users => ({
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length
  })
);

// component.ts
export class DashboardComponent {
  activeUsers$ = this.store.select(selectActiveUsers);
  adminUsers$ = this.store.select(selectUsersByRole('admin'));
  stats$ = this.store.select(selectUserStats);
}
```

### After (React + Redux Toolkit)

```typescript
// store/selectors.ts
import { createSelector } from '@reduxjs/toolkit';

const selectUserState = (state: RootState) => state.users;

export const selectAllUsers = createSelector(
  selectUserState,
  (state) => state.users
);

export const selectActiveUsers = createSelector(
  selectAllUsers,
  (users) => users.filter(u => u.isActive)
);

export const makeSelectUsersByRole = () =>
  createSelector(
    [selectAllUsers, (_state, role: string) => role],
    (users, role) => users.filter(u => u.role === role)
  );

export const selectUserStats = createSelector(
  selectAllUsers,
  (users) => ({
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length
  })
);

// Dashboard.tsx
export const Dashboard = () => {
  const activeUsers = useSelector(selectActiveUsers);
  const adminUsers = useSelector((state: RootState) =>
    makeSelectUsersByRole()(state, 'admin')
  );
  const stats = useSelector(selectUserStats);

  return (
    <div>
      <div>Active: {activeUsers.length}</div>
      <div>Admins: {adminUsers.length}</div>
      <div>Stats: {JSON.stringify(stats)}</div>
    </div>
  );
};
```

**React Query 방식 (더 간단)**:

```typescript
export const Dashboard = () => {
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getUsers,
    select: (data) => ({
      all: data,
      active: data.filter(u => u.isActive),
      admins: data.filter(u => u.role === 'admin'),
      stats: {
        total: data.length,
        active: data.filter(u => u.isActive).length,
        inactive: data.filter(u => !u.isActive).length
      }
    })
  });

  return (
    <div>
      <div>Active: {users.active.length}</div>
      <div>Admins: {users.admins.length}</div>
      <div>Stats: {JSON.stringify(users.stats)}</div>
    </div>
  );
};
```

## 패턴 8: 낙관적 업데이트 (Optimistic Updates)

### Before (NgRx)

```typescript
// effects.ts
updateUser$ = createEffect(() =>
  this.actions$.pipe(
    ofType(updateUser),
    pessimisticUpdate({
      run: ({ user }) => {
        return this.userService.updateUser(user).pipe(
          map(updated => updateUserSuccess({ user: updated }))
        );
      },
      onError: (_, error) => updateUserFailure({ error })
    })
  )
);

// 또는 낙관적 업데이트
updateUser$ = createEffect(() =>
  this.actions$.pipe(
    ofType(updateUser),
    optimisticUpdate({
      run: ({ user }) => this.userService.updateUser(user).pipe(
        map(updated => updateUserSuccess({ user: updated }))
      ),
      undoAction: (_, error) => updateUserFailure({ error })
    })
  )
);
```

### After (React Query)

```typescript
// hooks/useUpdateUser.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.updateUser,

    // 낙관적 업데이트
    onMutate: async (updatedUser) => {
      // 진행 중인 리페칭 취소
      await queryClient.cancelQueries({ queryKey: ['users'] });

      // 이전 데이터 저장 (롤백용)
      const previousUsers = queryClient.getQueryData<User[]>(['users']);

      // 낙관적 업데이트
      queryClient.setQueryData<User[]>(['users'], (old) =>
        old?.map(user => user.id === updatedUser.id ? updatedUser : user)
      );

      return { previousUsers };
    },

    // 에러 시 롤백
    onError: (err, _, context) => {
      queryClient.setQueryData(['users'], context?.previousUsers);
    },

    // 성공 시 서버 데이터로 재검증
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};

// UserEdit.tsx
export const UserEdit = ({ user }: { user: User }) => {
  const updateUser = useUpdateUser();

  const handleSave = (updates: Partial<User>) => {
    updateUser.mutate({ ...user, ...updates });
  };

  return (
    <form onSubmit={handleSave}>
      <input defaultValue={user.name} />
      <button type="submit" disabled={updateUser.isPending}>
        {updateUser.isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
};
```

**장점**:
- UI 즉시 업데이트 (빠른 UX)
- 자동 롤백 기능
- 에러 처리 간단

## 패턴 9: 상태 영속화 (Persistence)

### Before (NgRx + localStorage)

```typescript
// meta-reducers.ts
export function storageMetaReducer(reducer: ActionReducer<any>): ActionReducer<any> {
  return (state, action) => {
    const nextState = reducer(state, action);
    localStorage.setItem('appState', JSON.stringify(nextState));
    return nextState;
  };
}

// app.module.ts
StoreModule.forRoot(reducers, {
  metaReducers: [storageMetaReducer]
})

// 초기 상태 로드
const savedState = JSON.parse(localStorage.getItem('appState') || '{}');
StoreModule.forRoot(reducers, { initialState: savedState })
```

### After (Redux Toolkit + Redux Persist)

```typescript
// store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user', 'settings'] // 영속화할 reducer만 선택
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    })
});

export const persistor = persistStore(store);

// App.tsx
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

export const App = () => (
  <Provider store={store}>
    <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
      <Main />
    </PersistGate>
  </Provider>
);
```

**React Query Persist**:

```typescript
// App.tsx
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24 // 24시간
    }
  }
});

const persister = createSyncStoragePersister({
  storage: window.localStorage
});

export const App = () => (
  <PersistQueryClientProvider
    client={queryClient}
    persistOptions={{ persister }}
  >
    <Main />
  </PersistQueryClientProvider>
);
```

## 패턴 10: Zustand (Redux 대안)

Redux Toolkit보다 더 간단한 Zustand:

```typescript
// store/useUserStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  addUser: (user: User) => void;
  removeUser: (id: string) => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        users: [],
        loading: false,
        error: null,

        fetchUsers: async () => {
          set({ loading: true });
          try {
            const users = await userService.getUsers();
            set({ users, loading: false });
          } catch (error: any) {
            set({ error: error.message, loading: false });
          }
        },

        addUser: (user) =>
          set((state) => ({ users: [...state.users, user] })),

        removeUser: (id) =>
          set((state) => ({
            users: state.users.filter(u => u.id !== id)
          }))
      }),
      { name: 'user-storage' }
    )
  )
);

// UserList.tsx
export const UserList = () => {
  const { users, loading, fetchUsers } = useUserStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (loading) return <div>Loading...</div>;

  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
};
```

**Zustand 장점**:
- Redux Toolkit보다 70% 코드 감소
- Provider 불필요
- 보일러플레이트 최소화
- TypeScript 타입 추론 완벽
- DevTools, Persist 미들웨어 내장

## 성능 비교

| 메트릭 | NgRx | Redux Toolkit | React Query | Zustand |
|-------|------|---------------|-------------|---------|
| 번들 크기 | ~280KB | ~45KB | ~40KB | ~8KB |
| 초기 설정 코드 | ~200줄 | ~50줄 | ~20줄 | ~10줄 |
| 보일러플레이트 | 매우 많음 | 적음 | 거의 없음 | 거의 없음 |
| 학습 곡선 | 가파름 | 중간 | 완만 | 매우 완만 |
| 서버 상태 관리 | 불편 | 가능 | **최적** | 가능 |

## 마이그레이션 권장 전략

### 1단계: 서버 상태 분리
```typescript
// 서버 상태 (API 데이터) → React Query
const { data: users } = useQuery(['users'], fetchUsers);

// UI 상태 (전역) → Zustand 또는 Redux Toolkit
const theme = useThemeStore(state => state.theme);

// 로컬 상태 → useState
const [isOpen, setIsOpen] = useState(false);
```

### 2단계: NgRx → Redux Toolkit 변환
- Effects → createAsyncThunk
- Actions/Reducers → createSlice
- Selectors → 그대로 유지

### 3단계: Redux Toolkit → React Query (선택)
- 서버 상태만 React Query로 이전
- UI 상태는 Redux Toolkit 또는 Zustand 유지

## 마이그레이션 체크리스트

### 분석 단계
- [ ] 서버 상태 vs UI 상태 구분
- [ ] NgRx Store 구조 분석
- [ ] Effects 목록 작성
- [ ] Selector 의존성 확인

### 변환 단계
- [ ] React Query 설정
- [ ] createAsyncThunk로 Effects 변환
- [ ] createSlice로 Reducers 통합
- [ ] Selectors 변환
- [ ] Component에서 useSelector/useQuery 사용

### 테스트 단계
- [ ] 모든 액션 동작 확인
- [ ] 비동기 로직 테스트
- [ ] 캐싱 동작 확인
- [ ] DevTools 확인

## 실전 팁

### ✅ 권장사항

1. **서버 상태는 React Query**
   - 자동 캐싱, 리페칭, 에러 처리
   - Redux보다 80% 코드 감소

2. **전역 UI 상태는 Zustand**
   - 간단하고 가벼움
   - Provider 불필요

3. **로컬 상태는 useState**
   - 과도한 전역 상태 지양

### ⚠️ 흔한 실수

1. **모든 것을 Redux에 넣기**
   ```typescript
   // ❌ 서버 데이터를 Redux에
   const users = useSelector(state => state.users);

   // ✅ React Query 사용
   const { data: users } = useQuery(['users'], fetchUsers);
   ```

2. **불필요한 Selector**
   ```typescript
   // ❌ 단순 선택에 createSelector
   const selectCount = createSelector(...);

   // ✅ 직접 선택
   const count = useSelector(state => state.count);
   ```

## 다음 단계

- [Template → JSX](../part-03-ui-and-styling/01-template-to-jsx)
- [테스팅](../part-04-tooling/02-testing)
- [성능 최적화](../part-04-tooling/04-performance)
