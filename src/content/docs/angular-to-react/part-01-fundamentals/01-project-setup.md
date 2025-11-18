---
title: 프로젝트 설정 및 구조 변환
description: Angular CLI 프로젝트를 React (Vite/CRA) 프로젝트로 변환하는 방법
sidebar:
  order: 1
  badge:
    text: "필수"
    variant: "success"
---

# 프로젝트 설정 및 구조 변환

Angular CLI로 생성된 프로젝트를 React 프로젝트로 변환하는 완벽한 가이드입니다.

## 개요

**마이그레이션 난이도**: ⭐⭐ (초급-중급)
**예상 소요 시간**: 1-2시간 (프로젝트 규모에 따라)
**영향 범위**: 전체 프로젝트 구조

### 주요 변경사항

| 항목 | Angular | React |
|-----|---------|-------|
| 빌드 도구 | Angular CLI | Vite / Create React App |
| 프로젝트 구조 | `src/app/` | `src/` |
| 설정 파일 | `angular.json` | `vite.config.ts` / `package.json` |
| 엔트리 포인트 | `main.ts` | `main.tsx` / `index.tsx` |

## Before (Angular)

### 프로젝트 구조
```
my-angular-app/
├── angular.json
├── package.json
├── tsconfig.json
├── src/
│   ├── main.ts
│   ├── index.html
│   ├── styles.css
│   ├── app/
│   │   ├── app.module.ts
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.css
│   │   └── components/
│   ├── environments/
│   └── assets/
└── e2e/
```

### package.json (Angular)
```json
{
  "name": "my-angular-app",
  "version": "1.0.0",
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "test": "ng test"
  },
  "dependencies": {
    "@angular/animations": "^17.0.0",
    "@angular/common": "^17.0.0",
    "@angular/compiler": "^17.0.0",
    "@angular/core": "^17.0.0",
    "@angular/forms": "^17.0.0",
    "@angular/platform-browser": "^17.0.0",
    "@angular/platform-browser-dynamic": "^17.0.0",
    "@angular/router": "^17.0.0",
    "rxjs": "^7.8.0",
    "tslib": "^2.6.0",
    "zone.js": "^0.14.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^17.0.0",
    "@angular/cli": "^17.0.0",
    "@angular/compiler-cli": "^17.0.0",
    "typescript": "~5.2.0"
  }
}
```

## After (React 18+ with Vite)

### 프로젝트 구조
```
my-react-app/
├── vite.config.ts
├── package.json
├── tsconfig.json
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── assets/
└── public/
```

### package.json (React)
```json
{
  "name": "my-react-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.20.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.6.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

### vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

## 마이그레이션 단계

### 1단계: 새 React 프로젝트 생성

```bash
# Vite 사용 (권장)
npm create vite@latest my-react-app -- --template react-ts

# 또는 Create React App (레거시)
npx create-react-app my-react-app --template typescript
```

### 2단계: 의존성 매핑 및 설치

| Angular 패키지 | React 대응 패키지 | 목적 |
|----------------|------------------|------|
| `@angular/core` | `react` | 핵심 라이브러리 |
| `@angular/common` | - | 내장 기능으로 대체 |
| `@angular/forms` | `react-hook-form` | 폼 관리 |
| `@angular/router` | `react-router-dom` | 라우팅 |
| `@angular/animations` | `framer-motion` | 애니메이션 |
| `rxjs` | `@tanstack/react-query` | 비동기 상태 관리 |
| `@angular/material` | `@mui/material` | UI 컴포넌트 |
| `@ngrx/store` | `@reduxjs/toolkit` | 상태 관리 |

```bash
# React 핵심 패키지
npm install react react-dom react-router-dom

# 유틸리티 라이브러리
npm install @tanstack/react-query axios

# UI 라이브러리 (선택)
npm install @mui/material @emotion/react @emotion/styled

# 폼 관리
npm install react-hook-form zod @hookform/resolvers

# 개발 도구
npm install -D @types/react @types/react-dom
npm install -D @vitejs/plugin-react vite vitest
```

### 3단계: TypeScript 설정 조정

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 4단계: 엔트리 포인트 변환

**Angular: src/main.ts**
```typescript
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
```

**React: src/main.tsx**
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 5단계: HTML 템플릿 조정

**Angular: src/index.html**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>MyAngularApp</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <app-root></app-root>
</body>
</html>
```

**React: index.html**
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## 마이그레이션 체크리스트

- [ ] 새 React 프로젝트 생성 (Vite 또는 CRA)
- [ ] package.json 의존성 매핑 확인
- [ ] 필요한 React 패키지 설치
- [ ] tsconfig.json 설정 조정
- [ ] vite.config.ts 설정 (경로 alias 등)
- [ ] main.tsx 엔트리 포인트 생성
- [ ] index.html 조정
- [ ] 환경 변수 설정 (.env 파일)
- [ ] 빌드 스크립트 테스트
- [ ] 개발 서버 실행 확인

## 실전 팁

### 성능 최적화

**빌드 속도 비교**
- Angular CLI: ~30-60초 (중형 프로젝트)
- Vite: ~5-10초 (동일 프로젝트)
- 개선율: **70-80% 빠름**

### Vite vs Create React App

| 기준 | Vite | Create React App |
|-----|------|------------------|
| 개발 서버 시작 | < 1초 | 5-10초 |
| HMR 속도 | 즉시 | 1-2초 |
| 빌드 속도 | 매우 빠름 | 느림 |
| 설정 자유도 | 높음 | 낮음 |
| 권장 여부 | ✅ 강력 권장 | ⚠️ 레거시 |

### 흔한 실수

❌ **잘못된 방법**
```typescript
// Angular 스타일로 모듈 임포트
import { Component } from '@angular/core';
```

✅ **올바른 방법**
```typescript
// React 스타일
import { useState, useEffect } from 'react';
```

### 환경 변수 처리

**Angular: environment.ts**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

**React: .env**
```bash
VITE_API_URL=http://localhost:3000/api
```

**사용 방법**
```typescript
// Vite
const apiUrl = import.meta.env.VITE_API_URL;

// CRA
const apiUrl = process.env.REACT_APP_API_URL;
```

## 디렉토리 구조 권장사항

```
src/
├── main.tsx                 # 엔트리 포인트
├── App.tsx                  # 루트 컴포넌트
├── components/              # 재사용 컴포넌트
│   ├── common/             # 공통 컴포넌트
│   ├── layout/             # 레이아웃 컴포넌트
│   └── features/           # 기능별 컴포넌트
├── hooks/                   # Custom Hooks
├── pages/                   # 페이지 컴포넌트
├── services/                # API 서비스
├── store/                   # 상태 관리
├── types/                   # TypeScript 타입
├── utils/                   # 유틸리티 함수
├── styles/                  # 글로벌 스타일
└── assets/                  # 정적 자산
```

## 다음 단계

프로젝트 구조 변환이 완료되었다면:
1. [컴포넌트 기초 변환](./02-component-basics)으로 이동
2. Angular 컴포넌트를 React로 변환하기 시작
3. 점진적으로 기능 추가 및 테스트

## 참고 자료

- [Vite 공식 문서](https://vitejs.dev/)
- [React 공식 문서](https://react.dev/)
- [TypeScript 설정 가이드](https://www.typescriptlang.org/tsconfig)
- [Create React App → Vite 마이그레이션](https://vitejs.dev/guide/migration.html)
