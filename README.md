# Migration eBooks

프레임워크 마이그레이션을 위한 전문 가이드 플랫폼

## 🚀 개요

이 프로젝트는 다양한 프레임워크 간 마이그레이션 가이드를 제공하는 전문 eBook 플랫폼입니다. Astro Starlight를 기반으로 구축되며, 각 마이그레이션 경로별로 독립적인 콘텐츠를 관리합니다.

## 📚 이용 가능한 가이드

### ✅ Angular to React (이용 가능)
- **페이지 수**: 70-100
- **코드 샘플**: 150+
- **파트 구성**: 5개 파트 (기초 개념, 고급 패턴, UI & 스타일링, 도구 및 환경, 실전 사례)
- **난이도**: 초급~고급
- **링크**: [가이드 보기](/migrations/angular-to-react/)

### 🔜 React to Vue (준비 중)
- **예상 출시**: v1.2

### 🔜 Vue to Svelte (준비 중)
- **예상 출시**: v1.3

## 🛠️ 기술 스택

- **Astro** v4.16+ - 정적 사이트 생성
- **Starlight** v0.28+ - 문서 테마
- **TypeScript** v5.6+ - 타입 안정성
- **MDX** - 인터랙티브 문서

## 📦 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (localhost:4321)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 타입 체크
npm run type-check

# 전체 검증 (타입 체크 + 린트 + 빌드)
npm run validate
```

## 📁 프로젝트 구조

```
migration-ebooks/
├── src/
│   ├── content/
│   │   ├── docs/
│   │   │   ├── angular-to-react/    # Angular → React 가이드
│   │   │   ├── react-to-vue/        # React → Vue 가이드 (준비 중)
│   │   │   └── vue-to-svelte/       # Vue → Svelte 가이드 (준비 중)
│   │   └── config.ts
│   ├── pages/
│   │   └── index.astro              # 랜딩 페이지
│   ├── styles/
│   │   └── custom.css               # 커스텀 스타일
│   └── assets/
│       └── logo.svg                 # 로고
├── astro.config.mjs                 # Astro 설정
├── tsconfig.json                    # TypeScript 설정
├── package.json
└── CLAUDE.md                        # 프로젝트 명세서
```

## 🎯 주요 기능

- ✅ 150개 이상의 실제 동작 코드 예제
- ✅ Before/After 코드 비교
- ✅ 단계별 마이그레이션 가이드
- ✅ 실전 케이스 스터디
- ✅ 검색 및 네비게이션
- ✅ 다크 모드 지원
- ✅ 반응형 디자인
- ✅ SEO 최적화

## 📊 성능 목표

- **빌드 시간**: < 30초 (100페이지 기준)
- **페이지 로드**: < 2초 (3G 기준)
- **Lighthouse 점수**: 95+ (모든 항목)
- **번들 크기**: < 100KB (페이지당)

## 🤝 기여하기

기여는 언제나 환영합니다!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### 기여 가이드라인

- 모든 코드 샘플은 실제로 동작해야 합니다
- ESLint/Prettier 규칙을 준수해야 합니다
- 기존 문서 스타일을 따라주세요
- 가능하면 실전 예제를 포함해주세요

## 📄 라이선스

이 프로젝트는 오픈소스이며 자유롭게 사용할 수 있습니다.

## 🔗 링크

- [GitHub Repository](https://github.com/thatseeai/migrations)
- [Live Site](https://thatseeai.github.io/migrations/)
- [Issue Tracker](https://github.com/thatseeai/migrations/issues)

## 📮 문의

- 버그 리포트: [GitHub Issues](https://github.com/thatseeai/migrations/issues)
- 기능 제안: [GitHub Discussions](https://github.com/thatseeai/migrations/discussions)

---

**Made with ❤️ using Astro Starlight**
