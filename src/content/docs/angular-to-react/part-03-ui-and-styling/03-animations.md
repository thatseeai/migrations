---
title: 애니메이션 변환
description: Angular Animations를 React 애니메이션 라이브러리로 변환
sidebar:
  order: 3
---

# 애니메이션 변환

Angular Animations를 React의 애니메이션 솔루션으로 변환하는 방법을 다룹니다.

## 개요

**마이그레이션 난이도**: ⭐⭐⭐⭐ (고급)
**예상 소요 시간**: 2-4시간

### 애니메이션 라이브러리 비교

| 라이브러리 | 용도 | 학습 곡선 | 번들 크기 | 권장 |
|-----------|------|----------|----------|------|
| **Framer Motion** | 복잡한 애니메이션, 제스처 | 중 | ~60KB | ✅ |
| **React Spring** | 물리 기반, 부드러운 전환 | 고 | ~30KB | ⚠️ |
| **CSS Transitions** | 간단한 전환 | 저 | 0KB | ✅ |
| **React Transition Group** | 마운트/언마운트 | 중 | ~10KB | ✅ |

## 패턴 1: 기본 Fade In/Out

### Before (Angular Animations)

```typescript
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-fade',
  template: `
    <div *ngIf="isVisible" [@fadeInOut]>
      Content
    </div>
  `,
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class FadeComponent {
  isVisible = true;
}
```

### After (Framer Motion)

```typescript
import { AnimatePresence, motion } from 'framer-motion';

export const Fade = () => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          Content
        </motion.div>
      )}
    </AnimatePresence>
  );
};
```

**주요 차이**:
- `trigger` → `motion` 컴포넌트
- `:enter/:leave` → `initial/animate/exit`
- `AnimatePresence` 필요 (언마운트 애니메이션)

## 패턴 2: Slide 애니메이션

### Before (Angular)

```typescript
trigger('slideInOut', [
  transition(':enter', [
    style({ transform: 'translateX(-100%)' }),
    animate('300ms ease-out', style({ transform: 'translateX(0)' }))
  ]),
  transition(':leave', [
    animate('300ms ease-in', style({ transform: 'translateX(100%)' }))
  ])
])
```

### After (Framer Motion)

```typescript
<motion.div
  initial={{ x: '-100%' }}
  animate={{ x: 0 }}
  exit={{ x: '100%' }}
  transition={{ duration: 0.3, ease: 'easeOut' }}
>
  Sliding content
</motion.div>
```

## 패턴 3: 리스트 애니메이션

### Before (Angular)

```typescript
trigger('listAnimation', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(-20px)' }),
      stagger(100, [
        animate('300ms', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ], { optional: true })
  ])
])
```

### After (Framer Motion)

```typescript
import { motion } from 'framer-motion';

export const ListAnimation = ({ items }: { items: Item[] }) => {
  return (
    <div>
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        >
          {item.name}
        </motion.div>
      ))}
    </div>
  );
};

// 또는 variants 사용 (권장)
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: -20 },
  show: { opacity: 1, y: 0 }
};

export const ListAnimation = ({ items }: { items: Item[] }) => {
  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {items.map((item) => (
        <motion.div key={item.id} variants={item}>
          {item.name}
        </motion.div>
      ))}
    </motion.div>
  );
};
```

## 패턴 4: Route 전환 애니메이션

### Before (Angular)

```typescript
trigger('routeAnimations', [
  transition('* <=> *', [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        width: '100%'
      })
    ], { optional: true }),
    query(':enter', [
      style({ opacity: 0 })
    ], { optional: true }),
    query(':leave', [
      animate('300ms', style({ opacity: 0 }))
    ], { optional: true }),
    query(':enter', [
      animate('300ms', style({ opacity: 1 }))
    ], { optional: true })
  ])
])
```

### After (Framer Motion + React Router)

```typescript
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, Routes, Route } from 'react-router-dom';

export const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Home />
          </motion.div>
        } />
        <Route path="/about" element={
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
          >
            <About />
          </motion.div>
        } />
      </Routes>
    </AnimatePresence>
  );
};
```

## 패턴 5: Gesture 애니메이션 (Drag, Hover)

### Framer Motion

```typescript
export const DraggableCard = () => {
  return (
    <motion.div
      drag
      dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
      style={{
        width: 200,
        height: 200,
        background: '#007bff',
        borderRadius: 8,
        cursor: 'grab'
      }}
    >
      Drag me!
    </motion.div>
  );
};
```

## 패턴 6: Spring 애니메이션 (React Spring)

### React Spring

```typescript
import { useSpring, animated } from '@react-spring/web';

export const SpringBox = () => {
  const [isToggled, setIsToggled] = useState(false);

  const springs = useSpring({
    from: { x: 0, opacity: 0 },
    to: {
      x: isToggled ? 200 : 0,
      opacity: isToggled ? 1 : 0.5
    },
    config: { tension: 170, friction: 26 } // 물리 기반
  });

  return (
    <>
      <animated.div
        style={{
          ...springs,
          width: 100,
          height: 100,
          background: '#007bff',
          borderRadius: 8
        }}
      />
      <button onClick={() => setIsToggled(!isToggled)}>
        Toggle
      </button>
    </>
  );
};
```

## 패턴 7: CSS Transitions (간단한 경우)

### CSS만 사용

```typescript
// Animation.module.css
.fadeIn {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slideIn {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

// Component
import styles from './Animation.module.css';

export const SimpleAnimation = () => {
  const [show, setShow] = useState(false);

  return (
    <div>
      {show && <div className={styles.fadeIn}>Animated content</div>}
      <button onClick={() => setShow(!show)}>Toggle</button>
    </div>
  );
};
```

## 마이그레이션 전략

### 1단계: 간단한 애니메이션
- Fade, Slide → CSS Transitions

### 2단계: 복잡한 애니메이션
- 리스트, 제스처 → Framer Motion

### 3단계: 물리 기반
- 자연스러운 움직임 → React Spring

## 성능 최적화

1. **will-change 사용**
```typescript
<motion.div
  style={{ willChange: 'transform, opacity' }}
  animate={{ x: 100 }}
/>
```

2. **GPU 가속 속성 사용**
- `transform`, `opacity` (✅ 빠름)
- `width`, `height` (❌ 느림)

3. **AnimatePresence mode**
```typescript
<AnimatePresence mode="wait"> {/* 이전 애니메이션 완료 후 */}
<AnimatePresence mode="sync"> {/* 동시 실행 */}
```

## 다음 단계

- [Material → MUI](./04-material-to-mui) - UI 컴포넌트
- [성능 최적화](../part-04-tooling/04-performance)
