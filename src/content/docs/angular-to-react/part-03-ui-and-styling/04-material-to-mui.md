---
title: Angular Material을 MUI로 마이그레이션
description: Angular Material 컴포넌트를 Material-UI (MUI)로 변환하는 방법
sidebar:
  order: 4
---

# Angular Material을 MUI로 마이그레이션

Angular Material 컴포넌트를 Material-UI (MUI) v5로 변환하는 방법을 다룹니다.

## 개요

**마이그레이션 난이도**: ⭐⭐⭐ (중급)
**예상 소요 시간**: 3-5시간

### 컴포넌트 매핑

| Angular Material | MUI v5 | 변경사항 |
|------------------|--------|----------|
| `MatButton` | `Button` | Props 이름 변경 |
| `MatDialog` | `Dialog` | 구조 변경 |
| `MatTable` | `Table` / `DataGrid` | 복잡도 증가 |
| `MatFormField` | `TextField` | 간소화됨 |

## Before (Angular Material)

```typescript
import { MatButtonModule } from '@angular/material/button';

@Component({
  template: `
    <button mat-raised-button color="primary" (click)="save()">
      Save
    </button>
  `
})
export class MyComponent {}
```

## After (MUI)

```typescript
import { Button } from '@mui/material';

export const MyComponent = () => {
  return (
    <Button variant="contained" color="primary" onClick={save}>
      Save
    </Button>
  );
};
```

(Phase 3에서 30개 이상의 컴포넌트 매핑 추가 예정)

## 다음 단계

- [빌드 도구](../part-04-tooling/01-build-tools)
- [테스팅](../part-04-tooling/02-testing)
