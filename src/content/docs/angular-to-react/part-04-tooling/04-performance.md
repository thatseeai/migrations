---
title: 성능 최적화
description: React 애플리케이션의 성능을 최적화하는 방법
sidebar:
  order: 4
---

# 성능 최적화

React 애플리케이션의 성능을 최적화하는 다양한 기법을 다룹니다.

## 개요

**마이그레이션 난이도**: ⭐⭐⭐⭐ (고급)
**예상 소요 시간**: 4-8시간

### 최적화 기법

| 기법 | 개선율 | 적용 난이도 |
|-----|--------|------------|
| Code Splitting | 40-60% | 중 |
| React.memo | 20-40% | 저 |
| useMemo/useCallback | 10-30% | 중 |
| Virtualization | 70-90% | 고 |
| Lazy Loading | 30-50% | 중 |

## 주요 최적화 패턴

1. **메모이제이션** (`React.memo`, `useMemo`, `useCallback`)
2. **코드 스플리팅** (`React.lazy`, `Suspense`)
3. **가상화** (react-window, react-virtualized)
4. **이미지 최적화** (WebP, lazy loading)
5. **번들 크기 최적화**

## Before (최적화 전)

```typescript
export const ProductList = ({ products }) => {
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

## After (최적화 후)

```typescript
import { memo, useMemo } from 'react';
import { FixedSizeList } from 'react-window';

const ProductCard = memo(({ product }) => {
  // 컴포넌트 로직
});

export const ProductList = ({ products }) => {
  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => a.price - b.price),
    [products]
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={sortedProducts.length}
      itemSize={120}
    >
      {({ index, style }) => (
        <div style={style}>
          <ProductCard product={sortedProducts[index]} />
        </div>
      )}
    </FixedSizeList>
  );
};
```

(Phase 3에서 12개 이상의 최적화 기법 추가 예정)

## 다음 단계

- [점진적 마이그레이션](../part-05-real-world/01-incremental-migration)
- [흔한 실수](../part-05-real-world/02-common-pitfalls)
