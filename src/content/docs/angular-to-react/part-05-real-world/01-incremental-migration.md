---
title: 점진적 마이그레이션 전략
description: 대규모 Angular 애플리케이션을 단계적으로 React로 마이그레이션하는 방법
sidebar:
  order: 1
---

# 점진적 마이그레이션 전략

대규모 Angular 애플리케이션을 안전하게 React로 점진적으로 마이그레이션하는 전략을 다룹니다.

## 개요

**마이그레이션 난이도**: ⭐⭐⭐⭐⭐ (매우 고급)
**예상 소요 시간**: 프로젝트 규모에 따라 수주~수개월
**적용 대상**: 대규모 프로젝트 (10,000+ 줄)

### 마이그레이션 전략

| 전략 | 적합한 경우 | 소요 시간 | 리스크 |
|-----|-----------|----------|--------|
| **Big Bang** | 소규모 (<5K 줄) | 1-2주 | 높음 |
| **점진적** | 중대규모 (5K-50K) | 2-6개월 | 중간 |
| **Strangler Fig** | 대규모 (50K+) | 6-12개월 | 낮음 |

## 점진적 마이그레이션 단계

### 1단계: 준비 및 분석 (1-2주)

**목표**: 마이그레이션 범위 파악 및 계획 수립

- [ ] 코드베이스 분석
  - 총 컴포넌트 수 계산
  - 의존성 그래프 생성
  - 복잡도 평가 (순환 의존성, 커플링)

- [ ] 우선순위 결정
  - Leaf 컴포넌트 (의존성 없음) 우선
  - 비즈니스 가치가 낮은 기능 우선
  - 버그가 많은 코드 우선

- [ ] 기술 스택 결정
  - React 버전 (18+)
  - 상태 관리 (Redux Toolkit / React Query)
  - UI 라이브러리 (MUI / Ant Design)
  - 빌드 도구 (Vite)

### 2단계: 공존 환경 구축 (1-2주)

**목표**: Angular와 React가 동시에 작동하는 환경 구축

#### Module Federation 사용

```typescript
// webpack.config.js (Angular)
module.exports = {
  output: {
    publicPath: 'auto',
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'angular_app',
      filename: 'remoteEntry.js',
      exposes: {
        './AngularModule': './src/app/some-module/some.module.ts',
      },
      shared: {
        '@angular/core': { singleton: true, strictVersion: true },
        '@angular/common': { singleton: true, strictVersion: true },
      },
    }),
  ],
};

// webpack.config.js (React)
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'react_app',
      remotes: {
        angular_app: 'angular_app@http://localhost:4200/remoteEntry.js',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
};
```

#### iframe 활용 (간단한 방법)

```typescript
// Angular 앱에 React 컴포넌트 임베드
@Component({
  template: `
    <iframe
      [src]="reactAppUrl"
      width="100%"
      height="600px"
      frameborder="0">
    </iframe>
  `
})
export class ReactContainerComponent {
  reactAppUrl = 'http://localhost:3000/dashboard';
}
```

### 3단계: Leaf 컴포넌트 마이그레이션 (2-4주)

**목표**: 의존성이 없는 단순 컴포넌트부터 시작

```typescript
// Angular (Before)
@Component({
  selector: 'app-button',
  template: `
    <button
      [class]="variant"
      (click)="handleClick.emit()">
      {{ label }}
    </button>
  `
})
export class ButtonComponent {
  @Input() label!: string;
  @Input() variant = 'primary';
  @Output() handleClick = new EventEmitter();
}
```

```typescript
// React (After)
interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
  onClick: () => void;
}

export const Button: FC<ButtonProps> = ({
  label,
  variant = 'primary',
  onClick
}) => {
  return (
    <button className={variant} onClick={onClick}>
      {label}
    </button>
  );
};
```

### 4단계: 페이지 단위 마이그레이션 (4-12주)

**목표**: 독립적인 페이지/피처를 React로 교체

**마이그레이션 우선순위**:
1. ✅ 단순 페이지 (About, Contact)
2. ✅ 비즈니스 중요도 낮음 (Settings, Help)
3. ⚠️ 중요 페이지 (Dashboard, Profile)
4. ❌ 핵심 페이지 (Checkout, Payment) - 마지막

### 5단계: 공통 서비스 마이그레이션 (2-4주)

**목표**: 재사용되는 서비스를 Custom Hook으로 변환

```typescript
// Before (Angular Service)
@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  async login(credentials: Credentials): Promise<User> {
    const user = await this.http.post('/api/login', credentials).toPromise();
    this.userSubject.next(user);
    return user;
  }
}

// After (React Hook + Context)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (credentials: Credentials) => {
    const response = await axios.post('/api/login', credentials);
    setUser(response.data);
    return response.data;
  };

  return (
    <AuthContext.Provider value={{ user, login }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 6단계: 라우팅 통합 (1-2주)

**목표**: Angular Router와 React Router 통합

```typescript
// app-routing.module.ts (Angular)
const routes: Routes = [
  { path: '', component: HomeComponent },
  // React로 마이그레이션된 페이지는 래퍼 컴포넌트로
  { path: 'dashboard', component: ReactDashboardWrapperComponent },
  { path: 'profile', component: ProfileComponent }, // 아직 Angular
];

// ReactDashboardWrapperComponent
@Component({
  template: '<div id="react-dashboard-root"></div>'
})
export class ReactDashboardWrapperComponent implements OnInit, OnDestroy {
  private root?: Root;

  ngOnInit() {
    const container = document.getElementById('react-dashboard-root');
    if (container) {
      this.root = createRoot(container);
      this.root.render(<Dashboard />);
    }
  }

  ngOnDestroy() {
    this.root?.unmount();
  }
}
```

### 7단계: Angular 제거 (1-2주)

**목표**: 모든 마이그레이션 완료 후 Angular 의존성 제거

```bash
# Angular 패키지 제거
npm uninstall @angular/core @angular/common @angular/router
npm uninstall @angular/cli @angular/compiler-cli

# 빌드 설정 정리
rm angular.json
rm -rf src/app

# React만 남김
npm install react react-dom react-router-dom
```

## 실전 사례 연구

### 케이스 1: 중형 SaaS 애플리케이션

**프로젝트 규모**:
- 코드: 25,000줄
- 컴포넌트: 150개
- 개발자: 3명
- 소요 기간: 4개월

**타임라인**:
- Week 1-2: 분석 및 계획
- Week 3-4: 공존 환경 구축
- Week 5-8: Leaf 컴포넌트 마이그레이션 (50개)
- Week 9-14: 페이지 마이그레이션 (15개)
- Week 15-16: 정리 및 Angular 제거

**결과**:
- ✅ 번들 크기: 2.5MB → 800KB (68% 감소)
- ✅ 빌드 시간: 45초 → 8초 (82% 감소)
- ✅ 초기 로딩: 3.2초 → 1.1초 (66% 빠름)

### 케이스 2: 대형 엔터프라이즈 앱

**프로젝트 규모**:
- 코드: 80,000줄
- 컴포넌트: 400개
- 개발자: 8명
- 소요 기간: 8개월

**전략**: Strangler Fig 패턴
- 신규 기능은 모두 React로 개발
- 레거시 코드는 점진적으로 교체
- 두 프레임워크 6개월간 공존

**결과**:
- ✅ 비즈니스 중단 없음
- ✅ 점진적 개선
- ✅ 팀 학습 시간 확보

## 마이그레이션 체크리스트

### 시작 전
- [ ] 경영진/이해관계자 승인
- [ ] 충분한 테스트 커버리지 (>60%)
- [ ] 마이그레이션 팀 구성
- [ ] 타임라인 및 마일스톤 설정
- [ ] 롤백 계획 수립

### 진행 중
- [ ] 주간 진행 상황 리뷰
- [ ] 성능 메트릭 추적
- [ ] 버그 추적 및 수정
- [ ] 팀 교육 및 지식 공유
- [ ] 문서화

### 완료 후
- [ ] 모든 테스트 통과
- [ ] 성능 개선 확인
- [ ] Angular 의존성 제거
- [ ] 최종 문서화
- [ ] 회고 (Retrospective)

## 실전 팁

### 성공 요인

1. **작게 시작하기**: Big Bang 방식은 실패 확률이 높음
2. **테스트 우선**: 마이그레이션 전 충분한 테스트 작성
3. **팀 교육**: React 학습 시간 확보 (최소 2주)
4. **지속적 통합**: CI/CD 파이프라인 유지

### 흔한 실수

❌ **피해야 할 것**:
- 전체를 한 번에 마이그레이션
- 테스트 없이 진행
- 팀 교육 생략
- 기술 부채 무시

✅ **해야 할 것**:
- 점진적 접근
- 자동화된 테스트
- 코드 리뷰 강화
- 문서화

## 도구 및 리소스

- **코드 분석**: [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- **마이그레이션 도구**: [react-codemod](https://github.com/reactjs/react-codemod)
- **테스팅**: Jest, React Testing Library
- **모니터링**: Sentry, LogRocket

## 다음 단계

- [흔한 실수와 해결책](./02-common-pitfalls)
- [실제 케이스 스터디](./03-case-studies)
