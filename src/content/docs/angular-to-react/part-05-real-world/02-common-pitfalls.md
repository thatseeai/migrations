---
title: 흔한 실수와 해결책
description: Angular→React 마이그레이션 중 자주 발생하는 실수와 해결 방법
sidebar:
  order: 2
---

Angular에서 React로 마이그레이션할 때 자주 발생하는 실수들과 그 해결 방법을 다룹니다.

## 개요

**난이도**: ⭐⭐⭐ (중급-고급)
**예상 독서 시간**: 30-45분

이 문서에서는 실제 마이그레이션 프로젝트에서 발견된 20가지 이상의 흔한 실수를 다룹니다.

## 1. State 관리 실수

### ❌ 실수: State 직접 수정

```typescript
// 잘못된 방법
const [user, setUser] = useState({ name: 'John', age: 30 });

const updateAge = () => {
  user.age = 31; // ❌ 작동하지 않음!
  setUser(user);
};
```

### ✅ 해결책: 불변성 유지

```typescript
// 올바른 방법
const [user, setUser] = useState({ name: 'John', age: 30 });

const updateAge = () => {
  setUser(prev => ({ ...prev, age: 31 })); // ✅
};
```

## 2. useEffect 의존성 배열 실수

### ❌ 실수: 의존성 누락

```typescript
const [userId, setUserId] = useState(1);
const [user, setUser] = useState(null);

useEffect(() => {
  fetchUser(userId).then(setUser); // userId 사용
}, []); // ❌ 의존성 배열에 userId 없음!
```

### ✅ 해결책: 모든 의존성 명시

```typescript
useEffect(() => {
  fetchUser(userId).then(setUser);
}, [userId]); // ✅ userId 추가
```

## 3. 비동기 처리 실수

### ❌ 실수: cleanup 없이 비동기 처리

```typescript
useEffect(() => {
  async function loadData() {
    const data = await fetchData();
    setData(data); // ⚠️ 컴포넌트가 언마운트되어도 실행됨
  }
  loadData();
}, []);
```

### ✅ 해결책: 취소 플래그 사용

```typescript
useEffect(() => {
  let cancelled = false;

  async function loadData() {
    const data = await fetchData();
    if (!cancelled) { // ✅ 취소 확인
      setData(data);
    }
  }

  loadData();

  return () => {
    cancelled = true; // cleanup
  };
}, []);
```

## 4. 이벤트 핸들러 실수

### ❌ 실수: 함수를 즉시 실행

```typescript
<button onClick={handleClick()}>Click</button>
// ❌ handleClick()은 렌더링 시 즉시 실행됨
```

### ✅ 해결책: 함수 참조 전달

```typescript
<button onClick={handleClick}>Click</button>
// ✅ 함수 참조 전달

// 파라미터가 필요하면
<button onClick={() => handleClick(id)}>Click</button>
// ✅ 화살표 함수 사용
```

## 5. 조건부 Hook 호출

### ❌ 실수: 조건문 안에서 Hook 호출

```typescript
function Component({ shouldFetch }) {
  if (shouldFetch) {
    const data = useState(null); // ❌ 조건부 Hook!
  }
}
```

### ✅ 해결책: 항상 최상위에서 Hook 호출

```typescript
function Component({ shouldFetch }) {
  const [data, setData] = useState(null); // ✅ 최상위

  useEffect(() => {
    if (shouldFetch) { // 조건은 Hook 내부에
      fetchData().then(setData);
    }
  }, [shouldFetch]);
}
```

## 6. Key Props 누락

### ❌ 실수: 리스트 렌더링 시 key 없음

```typescript
{items.map(item => (
  <div>{item.name}</div> // ❌ key 없음
))}
```

### ✅ 해결책: 고유한 key 제공

```typescript
{items.map(item => (
  <div key={item.id}>{item.name}</div> // ✅ 고유한 ID
))}

// index를 key로 사용하는 것은 피하기
{items.map((item, index) => (
  <div key={index}>{item.name}</div> // ⚠️ 항목이 재정렬되면 문제
))}
```

## 7. Props 드릴링

### ❌ 실수: 과도한 Props 전달

```typescript
// App → Page → Section → Card → Button
function App() {
  const [user, setUser] = useState(null);
  return <Page user={user} setUser={setUser} />;
}

function Page({ user, setUser }) {
  return <Section user={user} setUser={setUser} />;
}

function Section({ user, setUser }) {
  return <Card user={user} setUser={setUser} />;
}
// ❌ 모든 컴포넌트에 전달
```

### ✅ 해결책: Context 사용

```typescript
const UserContext = createContext();

function App() {
  const [user, setUser] = useState(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Page />
    </UserContext.Provider>
  );
}

function Button() {
  const { user, setUser } = useContext(UserContext); // ✅ 필요한 곳에서만
}
```

## 8. 메모리 누수

### ❌ 실수: cleanup 함수 누락

```typescript
useEffect(() => {
  const subscription = eventEmitter.subscribe(handleEvent);
  // ❌ cleanup 없음 - 메모리 누수!
}, []);
```

### ✅ 해결책: cleanup 함수 반환

```typescript
useEffect(() => {
  const subscription = eventEmitter.subscribe(handleEvent);

  return () => {
    subscription.unsubscribe(); // ✅ cleanup
  };
}, []);
```

## 9. className vs class

### ❌ 실수: HTML의 class 속성 사용

```typescript
<div class="container">Content</div>
// ❌ React에서는 작동하지 않음
```

### ✅ 해결책: className 사용

```typescript
<div className="container">Content</div>
// ✅ React는 className을 사용
```

## 10. 상태 업데이트 타이밍

### ❌ 실수: 이전 state 참조

```typescript
const [count, setCount] = useState(0);

const increment = () => {
  setCount(count + 1);
  setCount(count + 1); // ❌ 여전히 0 + 1 = 1
};
```

### ✅ 해결책: 함수형 업데이트

```typescript
const increment = () => {
  setCount(prev => prev + 1);
  setCount(prev => prev + 1); // ✅ 2가 됨
};
```

## 실전 디버깅 체크리스트

마이그레이션 중 문제가 발생하면 다음을 확인하세요:

### State 관련
- [ ] State를 직접 수정하지 않았는가?
- [ ] 불변성을 유지하고 있는가?
- [ ] 함수형 업데이트를 사용해야 하는가?

### useEffect 관련
- [ ] 의존성 배열이 올바른가?
- [ ] cleanup 함수가 필요한가?
- [ ] 무한 루프가 발생하지 않는가?

### 성능 관련
- [ ] 불필요한 리렌더링이 있는가?
- [ ] useMemo/useCallback이 필요한가?
- [ ] React.memo가 도움이 되는가?

### Hook 규칙
- [ ] Hook을 최상위에서 호출하는가?
- [ ] 조건문/반복문 안에 Hook이 없는가?
- [ ] Custom Hook 이름이 use로 시작하는가?

## 다음 단계

- [실제 케이스 스터디](./03-case-studies)
- [성능 최적화](../part-04-tooling/04-performance)
