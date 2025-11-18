---
title: Angular Material을 MUI로 마이그레이션
description: Angular Material 컴포넌트를 Material-UI (MUI)로 변환하는 방법
sidebar:
  order: 4
---

Angular Material 컴포넌트를 Material-UI (MUI) v5로 변환하는 방법을 다룹니다.

## 개요

**마이그레이션 난이도**: ⭐⭐⭐ (중급)
**예상 소요 시간**: 3-5시간

## 설치

```bash
# Angular Material 제거
npm uninstall @angular/material @angular/cdk

# MUI 설치
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
```

## 컴포넌트 매핑 테이블

| Angular Material | MUI v5 | 주요 변경사항 |
|------------------|--------|-------------|
| `MatButton` | `Button` | variant prop 이름 |
| `MatIcon` | `Icon` / icons-material | 별도 패키지 |
| `MatFormField` + `MatInput` | `TextField` | 통합됨 |
| `MatCard` | `Card` + 서브 컴포넌트 | 구조 변경 |
| `MatDialog` | `Dialog` | API 유사 |
| `MatTable` | `Table` / `DataGrid` | DataGrid 더 강력 |
| `MatSnackBar` | `Snackbar` | 비슷 |
| `MatSelect` | `Select` | FormControl 필요 |

## 패턴 1: Button

### Before (Angular Material)

```typescript
<button mat-button>Basic</button>
<button mat-raised-button color="primary">Primary</button>
<button mat-raised-button color="accent" disabled>Disabled</button>
<button mat-icon-button>
  <mat-icon>favorite</mat-icon>
</button>
<button mat-fab color="primary">
  <mat-icon>add</mat-icon>
</button>
```

### After (MUI)

```typescript
import { Button, IconButton, Fab } from '@mui/material';
import { Favorite as FavoriteIcon, Add as AddIcon } from '@mui/icons-material';

<Button variant="text">Basic</Button>
<Button variant="contained" color="primary">Primary</Button>
<Button variant="contained" color="secondary" disabled>Disabled</Button>
<IconButton>
  <FavoriteIcon />
</IconButton>
<Fab color="primary">
  <AddIcon />
</Fab>
```

**주요 변경**:
- `mat-button` → `variant="text"`
- `mat-raised-button` → `variant="contained"`
- `color="accent"` → `color="secondary"`

## 패턴 2: Form Field + Input

### Before (Angular Material)

```typescript
<mat-form-field appearance="outline">
  <mat-label>Email</mat-label>
  <input matInput type="email" [(ngModel)]="email" required>
  <mat-error *ngIf="emailControl.hasError('required')">
    Email is required
  </mat-error>
  <mat-hint>Enter your email address</mat-hint>
</mat-form-field>
```

### After (MUI)

```typescript
import { TextField } from '@mui/material';

const [email, setEmail] = useState('');
const [error, setError] = useState('');

<TextField
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
  error={!!error}
  helperText={error || 'Enter your email address'}
  variant="outlined"
  fullWidth
/>
```

## 패턴 3: Card

### Before (Angular Material)

```typescript
<mat-card>
  <mat-card-header>
    <mat-card-title>Card Title</mat-card-title>
    <mat-card-subtitle>Card Subtitle</mat-card-subtitle>
  </mat-card-header>
  <mat-card-content>
    <p>Card content goes here</p>
  </mat-card-content>
  <mat-card-actions>
    <button mat-button>LIKE</button>
    <button mat-button>SHARE</button>
  </mat-card-actions>
</mat-card>
```

### After (MUI)

```typescript
import { Card, CardHeader, CardContent, CardActions, Button } from '@mui/material';

<Card>
  <CardHeader
    title="Card Title"
    subheader="Card Subtitle"
  />
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardActions>
    <Button size="small">Like</Button>
    <Button size="small">Share</Button>
  </CardActions>
</Card>
```

## 패턴 4: Dialog

### Before (Angular Material)

```typescript
// Component
export class DialogExampleComponent {
  constructor(public dialog: MatDialog) {}

  openDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { name: 'John' }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed', result);
    });
  }
}

// Dialog Component
@Component({
  template: `
    <h2 mat-dialog-title>Confirm</h2>
    <mat-dialog-content>
      <p>Are you sure, {{data.name}}?</p>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-button [mat-dialog-close]="true" color="primary">OK</button>
    </mat-dialog-actions>
  `
})
export class ConfirmDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
```

### After (MUI)

```typescript
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

export const DialogExample = () => {
  const [open, setOpen] = useState(false);
  const [name] = useState('John');

  const handleClose = (result?: boolean) => {
    setOpen(false);
    if (result) {
      console.log('Confirmed');
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>

      <Dialog open={open} onClose={() => handleClose()} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm</DialogTitle>
        <DialogContent>
          <p>Are you sure, {name}?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose()}>Cancel</Button>
          <Button onClick={() => handleClose(true)} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
```

## 패턴 5: Table

### Before (Angular Material)

```typescript
<table mat-table [dataSource]="dataSource">
  <ng-container matColumnDef="name">
    <th mat-header-cell *matHeaderCellDef>Name</th>
    <td mat-cell *matCellDef="let element">{{element.name}}</td>
  </ng-container>

  <ng-container matColumnDef="email">
    <th mat-header-cell *matHeaderCellDef>Email</th>
    <td mat-cell *matCellDef="let element">{{element.email}}</td>
  </ng-container>

  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
</table>
```

### After (MUI)

```typescript
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';

interface User {
  name: string;
  email: string;
}

export const UserTable = ({ users }: { users: User[] }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user, index) => (
            <TableRow key={index}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
```

## 패턴 6: Select

### Before (Angular Material)

```typescript
<mat-form-field>
  <mat-label>Choose option</mat-label>
  <mat-select [(ngModel)]="selectedValue">
    <mat-option value="option1">Option 1</mat-option>
    <mat-option value="option2">Option 2</mat-option>
    <mat-option value="option3">Option 3</mat-option>
  </mat-select>
</mat-form-field>
```

### After (MUI)

```typescript
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const [selectedValue, setSelectedValue] = useState('');

<FormControl fullWidth>
  <InputLabel>Choose option</InputLabel>
  <Select
    value={selectedValue}
    label="Choose option"
    onChange={(e) => setSelectedValue(e.target.value)}
  >
    <MenuItem value="option1">Option 1</MenuItem>
    <MenuItem value="option2">Option 2</MenuItem>
    <MenuItem value="option3">Option 3</MenuItem>
  </Select>
</FormControl>
```

## 패턴 7: Snackbar (Toast)

### Before (Angular Material)

```typescript
export class SnackBarExample {
  constructor(private snackBar: MatSnackBar) {}

  openSnackBar() {
    this.snackBar.open('Message sent', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
```

### After (MUI)

```typescript
import { Snackbar, Button } from '@mui/material';

export const SnackbarExample = () => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button onClick={handleClick}>Show Snackbar</Button>
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        message="Message sent"
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </>
  );
};
```

## 패턴 8: Theme 설정

### Before (Angular Material)

```scss
@use '@angular/material' as mat;

$my-theme: mat.define-light-theme((
  color: (
    primary: mat.define-palette(mat.$indigo-palette),
    accent: mat.define-palette(mat.$pink-palette),
  )
));

@include mat.all-component-themes($my-theme);
```

### After (MUI)

```typescript
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5'  // Indigo
    },
    secondary: {
      main: '#e91e63'  // Pink
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
  },
  spacing: 8  // 기본 spacing 단위
});

export const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Main />
    </ThemeProvider>
  );
};
```

## 마이그레이션 체크리스트

### 설치 및 설정
- [ ] MUI 패키지 설치
- [ ] Angular Material 제거
- [ ] Theme 설정
- [ ] 폰트 (Roboto) 및 아이콘 폰트 추가

### 컴포넌트 변환
- [ ] Button 변환
- [ ] Form 컴포넌트 변환
- [ ] Card 변환
- [ ] Dialog 변환
- [ ] Table 변환
- [ ] Icon 변환

### 스타일 조정
- [ ] spacing 시스템 확인
- [ ] 색상 팔레트 확인
- [ ] 반응형 브레이크포인트 확인

## 다음 단계

- [빌드 도구](../part-04-tooling/01-build-tools)
- [테스팅](../part-04-tooling/02-testing)
- [성능 최적화](../part-04-tooling/04-performance)
