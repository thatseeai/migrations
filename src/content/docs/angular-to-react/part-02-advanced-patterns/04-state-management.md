---
title: 상태 관리 마이그레이션
description: NgRx/RxJS를 Redux Toolkit/React Query로 변환하는 방법
sidebar:
  order: 4
---

# 상태 관리 마이그레이션

NgRx를 Redux Toolkit으로, RxJS를 React Query로 변환하는 방법을 다룹니다.

## 개요

**마이그레이션 난이도**: ⭐⭐⭐⭐⭐ (매우 고급)
**예상 소요 시간**: 4-8시간

### 주요 변경사항

| 항목 | Angular | React |
|-----|---------|-------|
| 글로벌 상태 | NgRx Store | Redux Toolkit |
| 비동기 상태 | RxJS | React Query |
| 액션 | `createAction` | `createSlice` |
| Selector | `createSelector` | `useSelector` |

## Before (Angular + NgRx)

```typescript
// user.actions.ts
export const loadUsers = createAction('[User] Load Users');
export const loadUsersSuccess = createAction(
  '[User] Load Users Success',
  props<{ users: User[] }>()
);

// user.reducer.ts
const userReducer = createReducer(
  initialState,
  on(loadUsersSuccess, (state, { users }) => ({
    ...state,
    users,
    loading: false
  }))
);

// user.effects.ts
@Injectable()
export class UserEffects {
  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadUsers),
      switchMap(() =>
        this.userService.getUsers().pipe(
          map(users => loadUsersSuccess({ users }))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private userService: UserService
  ) {}
}

// component.ts
export class UserListComponent {
  users$ = this.store.select(selectAllUsers);

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(loadUsers());
  }
}
```

## After (React + Redux Toolkit)

```typescript
// features/users/userSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async () => {
    const response = await axios.get('/api/users');
    return response.data;
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
        state.loading = false;
      });
  }
});

export default userSlice.reducer;

// Component.tsx
import { useDispatch, useSelector } from 'react-redux';

export const UserList = () => {
  const dispatch = useDispatch();
  const users = useSelector((state: RootState) => state.users.users);
  const loading = useSelector((state: RootState) => state.users.loading);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};
```

## React Query 사용 (권장)

```typescript
// Component.tsx
import { useQuery } from '@tanstack/react-query';

export const UserList = () => {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await axios.get('/api/users');
      return data;
    }
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {users?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};
```

## 패턴 예제

(더 많은 예제와 패턴이 Phase 3에서 추가됩니다)

## 마이그레이션 체크리스트

- [ ] Redux Toolkit 설치
- [ ] Store 설정
- [ ] Slice 생성
- [ ] Async Thunk 변환
- [ ] Selector 변환
- [ ] React Query 고려

## 다음 단계

- [Template → JSX](../part-03-ui-and-styling/01-template-to-jsx)
- [성능 최적화](../part-04-tooling/04-performance)
