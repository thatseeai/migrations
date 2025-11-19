---
title: 라이프사이클 메서드 변환
description: Angular 라이프사이클 훅을 React useEffect로 변환하는 완벽한 가이드
sidebar:
  order: 4
  badge:
    text: "필수"
    variant: "success"
---

Angular의 라이프사이클 훅을 React의 `useEffect`로 변환하는 방법을 다룹니다.

## 개요

**마이그레이션 난이도**: ⭐⭐⭐⭐ (고급)
**예상 소요 시간**: 40-60분
**핵심 개념**: `useEffect`, 의존성 배열, cleanup 함수

### 라이프사이클 매핑 테이블

| Angular | React | 용도 |
|---------|-------|------|
| `ngOnInit` | `useEffect(() => {}, [])` | 컴포넌트 마운트 |
| `ngOnChanges` | `useEffect(() => {}, [deps])` | Props 변경 감지 |
| `ngOnDestroy` | `useEffect`의 return 함수 | 정리(cleanup) |
| `ngDoCheck` | `useEffect` (의존성 배열 없음) | 매 렌더링 |
| `ngAfterViewInit` | `useLayoutEffect` | DOM 업데이트 후 |

## Before (Angular)

### 기본 라이프사이클
```typescript
import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html'
})
export class UserProfileComponent implements OnInit, OnChanges, OnDestroy {
  @Input() userId!: number;

  user: User | null = null;
  private subscription?: Subscription;

  ngOnInit(): void {
    console.log('Component initialized');
    this.loadUser();
    this.setupSubscriptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userId'] && !changes['userId'].firstChange) {
      console.log('UserId changed:', changes['userId'].currentValue);
      this.loadUser();
    }
  }

  ngOnDestroy(): void {
    console.log('Component destroyed');
    this.subscription?.unsubscribe();
  }

  private loadUser(): void {
    this.userService.getUser(this.userId).subscribe(user => {
      this.user = user;
    });
  }

  private setupSubscriptions(): void {
    this.subscription = this.eventService.events$.subscribe(event => {
      console.log('Event:', event);
    });
  }
}
```

## After (React 18+)

### useEffect로 변환
```typescript
import { FC, useState, useEffect } from 'react';

interface UserProfileProps {
  userId: number;
}

export const UserProfile: FC<UserProfileProps> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);

  // ngOnInit - 컴포넌트 마운트 시 1회 실행
  useEffect(() => {
    console.log('Component initialized');
    setupSubscriptions();

    // ngOnDestroy - cleanup 함수
    return () => {
      console.log('Component destroyed');
    };
  }, []); // 빈 배열 = 마운트/언마운트 시만

  // ngOnChanges - userId 변경 감지
  useEffect(() => {
    console.log('UserId changed:', userId);
    loadUser();
  }, [userId]); // userId가 변경될 때마다

  const loadUser = async () => {
    const userData = await userService.getUser(userId);
    setUser(userData);
  };

  const setupSubscriptions = () => {
    const subscription = eventService.events$.subscribe(event => {
      console.log('Event:', event);
    });

    // cleanup에서 구독 해제
    return () => subscription.unsubscribe();
  };

  return (
    <div>
      {user && <h1>{user.name}</h1>}
    </div>
  );
};
```

## useEffect 패턴

### 1. 컴포넌트 마운트 (ngOnInit)

**Angular**
```typescript
ngOnInit(): void {
  this.fetchData();
  this.initializeComponent();
}
```

**React**
```typescript
useEffect(() => {
  fetchData();
  initializeComponent();
}, []); // 빈 배열 = 마운트 시 1회만
```

### 2. Props 변경 감지 (ngOnChanges)

**Angular**
```typescript
@Input() searchQuery!: string;

ngOnChanges(changes: SimpleChanges): void {
  if (changes['searchQuery']) {
    this.search(this.searchQuery);
  }
}
```

**React**
```typescript
interface Props {
  searchQuery: string;
}

const Component: FC<Props> = ({ searchQuery }) => {
  useEffect(() => {
    search(searchQuery);
  }, [searchQuery]); // searchQuery 변경 시마다
};
```

### 3. Cleanup (ngOnDestroy)

**Angular**
```typescript
private intervalId?: number;

ngOnInit(): void {
  this.intervalId = window.setInterval(() => {
    this.tick();
  }, 1000);
}

ngOnDestroy(): void {
  if (this.intervalId) {
    window.clearInterval(this.intervalId);
  }
}
```

**React**
```typescript
useEffect(() => {
  const intervalId = window.setInterval(() => {
    tick();
  }, 1000);

  // cleanup 함수
  return () => {
    window.clearInterval(intervalId);
  };
}, []);
```

### 4. 여러 의존성 추적

**Angular**
```typescript
@Input() category!: string;
@Input() sortBy!: string;

ngOnChanges(changes: SimpleChanges): void {
  if (changes['category'] || changes['sortBy']) {
    this.loadProducts();
  }
}
```

**React**
```typescript
interface Props {
  category: string;
  sortBy: string;
}

const Component: FC<Props> = ({ category, sortBy }) => {
  useEffect(() => {
    loadProducts();
  }, [category, sortBy]); // 둘 중 하나라도 변경 시
};
```

## 고급 패턴

### 1. 조건부 실행

**Angular**
```typescript
ngOnChanges(changes: SimpleChanges): void {
  if (changes['userId'] && this.userId > 0) {
    this.loadUser();
  }
}
```

**React**
```typescript
useEffect(() => {
  if (userId > 0) {
    loadUser();
  }
}, [userId]);
```

### 2. 비동기 작업

**Angular**
```typescript
async ngOnInit(): Promise<void> {
  try {
    this.data = await this.dataService.fetch();
  } catch (error) {
    this.handleError(error);
  }
}
```

**React**
```typescript
useEffect(() => {
  let cancelled = false;

  const fetchData = async () => {
    try {
      const result = await dataService.fetch();
      if (!cancelled) {
        setData(result);
      }
    } catch (error) {
      if (!cancelled) {
        handleError(error);
      }
    }
  };

  fetchData();

  return () => {
    cancelled = true; // cleanup에서 취소 플래그 설정
  };
}, []);
```

### 3. DOM 조작 (ngAfterViewInit)

**Angular**
```typescript
@ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

ngAfterViewInit(): void {
  const ctx = this.canvasRef.nativeElement.getContext('2d');
  this.drawChart(ctx);
}
```

**React**
```typescript
import { useRef, useLayoutEffect } from 'react';

const Component = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      drawChart(ctx);
    }
  }, []);

  return <canvas ref={canvasRef} />;
};
```

## 실전 예제

### 예제 1: 타이머
```typescript
export const Timer: FC = () => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    console.log('Timer started');

    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    return () => {
      console.log('Timer stopped');
      clearInterval(interval);
    };
  }, []);

  return <div>Seconds: {seconds}</div>;
};
```

### 예제 2: 실시간 데이터 구독

**Angular**
```typescript
export class ChatComponent implements OnInit, OnDestroy {
  messages: Message[] = [];
  private subscription?: Subscription;

  ngOnInit(): void {
    this.subscription = this.chatService.messages$
      .subscribe(message => {
        this.messages = [...this.messages, message];
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
```

**React**
```typescript
export const Chat: FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const subscription = chatService.messages$.subscribe(message => {
      setMessages(prev => [...prev, message]);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>{msg.text}</div>
      ))}
    </div>
  );
};
```

### 예제 3: 윈도우 이벤트 리스너

**Angular**
```typescript
export class ScrollComponent implements OnInit, OnDestroy {
  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event): void {
    console.log('Scrolled');
  }

  ngOnDestroy(): void {
    // HostListener는 자동으로 정리됨
  }
}
```

**React**
```typescript
export const ScrollComponent: FC = () => {
  useEffect(() => {
    const handleScroll = (event: Event) => {
      console.log('Scrolled');
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return <div>Scroll to see console logs</div>;
};
```

### 예제 4: 문서 제목 업데이트

**Angular**
```typescript
import { Title } from '@angular/platform-browser';

export class PageComponent implements OnInit {
  @Input() title!: string;

  constructor(private titleService: Title) {}

  ngOnInit(): void {
    this.titleService.setTitle(this.title);
  }
}
```

**React**
```typescript
interface Props {
  title: string;
}

export const Page: FC<Props> = ({ title }) => {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return <div>Content</div>;
};
```

## useEffect 심화

### 의존성 배열 완벽 이해

```typescript
// 1. 마운트 시 1회만 실행
useEffect(() => {
  console.log('Mount');
}, []);

// 2. 매 렌더링마다 실행 (비권장)
useEffect(() => {
  console.log('Every render');
});

// 3. 특정 값 변경 시 실행
useEffect(() => {
  console.log('count changed');
}, [count]);

// 4. 여러 값 추적
useEffect(() => {
  console.log('Multiple deps');
}, [dep1, dep2, dep3]);
```

### 객체/배열 의존성 주의사항

```typescript
// ❌ 잘못된 방법 - 무한 루프!
const [user, setUser] = useState({ name: 'John' });

useEffect(() => {
  // user는 매번 새 객체이므로 무한 루프
  console.log(user);
}, [user]);

// ✅ 올바른 방법 1 - 특정 프로퍼티만 추적
useEffect(() => {
  console.log(user.name);
}, [user.name]);

// ✅ 올바른 방법 2 - useMemo
const userMemo = useMemo(() => user, [user.name]);
useEffect(() => {
  console.log(userMemo);
}, [userMemo]);
```

## 마이그레이션 체크리스트

- [ ] `ngOnInit` → `useEffect(() => {}, [])`
- [ ] `ngOnChanges` → `useEffect(() => {}, [deps])`
- [ ] `ngOnDestroy` → cleanup 함수 반환
- [ ] `ngAfterViewInit` → `useLayoutEffect`
- [ ] Subscription → cleanup에서 unsubscribe
- [ ] EventListener → cleanup에서 remove
- [ ] Timer → cleanup에서 clear
- [ ] 의존성 배열 정확히 지정
- [ ] ESLint의 exhaustive-deps 규칙 확인

## 실전 팁

### 흔한 실수

❌ **잘못된 방법**
```typescript
// 의존성 누락
useEffect(() => {
  fetchData(userId); // userId를 사용하지만 의존성에 없음
}, []);

// cleanup 누락
useEffect(() => {
  const sub = service.subscribe();
  // cleanup이 없어 메모리 누수!
}, []);

// async 함수를 직접 사용
useEffect(async () => {
  await fetchData(); // 에러!
}, []);
```

✅ **올바른 방법**
```typescript
// 의존성 명시
useEffect(() => {
  fetchData(userId);
}, [userId]);

// cleanup 함수 반환
useEffect(() => {
  const sub = service.subscribe();
  return () => sub.unsubscribe();
}, []);

// async는 내부 함수로
useEffect(() => {
  const fetch = async () => {
    await fetchData();
  };
  fetch();
}, []);
```

### ESLint 규칙 활성화

```json
{
  "extends": [
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

## 다음 단계

라이프사이클 변환을 마스터했다면:
1. [서비스 → Custom Hooks](../part-02-advanced-patterns/01-services-to-hooks)로 이동
2. 더 복잡한 로직을 Custom Hook으로 추출
3. React Query로 비동기 상태 관리 개선

## 관련 케이스

- [Props와 State](./03-props-and-state)
- [Custom Hooks](../part-02-advanced-patterns/01-services-to-hooks)
- [상태 관리](../part-02-advanced-patterns/04-state-management)
