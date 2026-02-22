---
name: skill-creator
description: "Use when the user wants to create a new skill document for Claude Code agents. This skill guides the creation of well-structured .md skill files in .claude/skills/ directory. Use when the user mentions: skill 만들기, 스킬 생성, create skill, new skill, 스킬 추가."
---

# Skill Creator

새로운 Claude Code skill 문서를 체계적으로 생성하는 스킬입니다.

## When to Use This Skill

- 새로운 기술 도메인에 대한 skill 문서가 필요할 때
- 기존 skill을 참고하여 새 skill을 만들 때
- 에이전트가 참조할 개발 가이드라인 문서를 작성할 때

## Skill 문서 생성 프로세스

### Step 1: 요구사항 수집

사용자에게 다음을 확인합니다:

1. **스킬 이름**: 어떤 도메인/기술에 대한 스킬인가? (예: backend-development, testing, devops)
2. **핵심 기술 스택**: 필수 기술은 무엇인가? (예: React, Spring Boot, FastAPI)
3. **적용 범위**: 이 스킬이 커버하는 작업 유형은? (예: API 개발, UI 구현, 테스트 작성)
4. **핵심 패턴/원칙**: 반드시 따라야 할 아키텍처 패턴이나 코딩 원칙이 있는가?

### Step 2: 문서 구조 작성

모든 skill 문서는 다음 구조를 따릅니다:

```markdown
---
name: {skill-name}
description: {언제 이 스킬을 사용하는지 설명. 트리거 키워드 포함.}
---

# {Skill Title}

{한 줄 요약}

## When to Use This Skill

- {사용 시나리오 1}
- {사용 시나리오 2}
- When the user mentions: {트리거 키워드들}

## Core Technology Stack

**REQUIRED technologies** (no confirmation needed):
- **{Tech 1}**: {역할}
- **{Tech 2}**: {역할}

**Technology validation workflow:**
{코어 스택 외 라이브러리 사용 시 확인 절차}

## Implementation Workflow

{구현 전 체크리스트}

## Architecture Patterns

{핵심 패턴 + 코드 예제}

## State/Data Management Strategy

{데이터 흐름 및 상태 관리 전략}

## Project Structure

{디렉토리 구조}

## Performance Optimization

{성능 최적화 가이드라인}

## Error Handling

{에러 처리 패턴}

## Testing Strategy

{테스트 방법론 및 예제}

## Summary Checklist

{최종 점검 체크리스트}

## Common Patterns Reference

{자주 쓰는 패턴 + 코드 예제}
```

### Step 3: Frontmatter 작성 규칙

#### `name` 필드
- 소문자 kebab-case 사용 (예: `frontend-development`, `api-testing`)
- 간결하고 도메인을 명확히 나타내는 이름

#### `description` 필드
- **첫 문장**: 이 스킬이 무엇을 하는지 명확히 서술
- **트리거 조건**: 어떤 상황에서 이 스킬이 활성화되어야 하는지
- **키워드**: 사용자가 언급할 수 있는 관련 키워드 나열
- 예시:
```yaml
description: Modern React development with TanStack Query and Zustand. Use when building React components, implementing state management, creating reusable UI patterns, or when the user mentions React, frontend, components, hooks, or web development.
```

### Step 4: 콘텐츠 작성 가이드라인

#### 필수 포함 항목
1. **Core Technology Stack**: 필수 기술과 선택 기술을 구분. 선택 기술 사용 시 사용자 확인 워크플로우 포함
2. **Implementation Workflow**: 구현 전 반드시 수행할 체크리스트
3. **Architecture Patterns**: 핵심 패턴을 코드 예제와 함께 제공. BAD/GOOD 비교 포함
4. **Project Structure**: 권장 디렉토리 구조
5. **Summary Checklist**: 최종 점검 항목

#### 코드 예제 작성 규칙
- **BAD/GOOD 비교**: 안티패턴과 권장 패턴을 대조하여 보여줌
  ```tsx
  // ❌ BAD: 이유 설명
  // 안티패턴 코드

  // ✅ GOOD: 이유 설명
  // 권장 패턴 코드
  ```
- **실제 사용 예시**: 추상적이지 않은 실무 레벨의 코드
- **타입 안전성**: TypeScript 사용 시 제네릭, 인터페이스 활용 예시 포함

#### 선택 포함 항목 (도메인에 따라)
- Performance Optimization
- Error Handling
- Testing Strategy
- Security Considerations
- Common Patterns Reference
- Resources (공식 문서 링크)

### Step 5: 파일 저장

- 경로: `.claude/skills/{skill-name}.md`
- 파일명은 frontmatter의 `name`과 동일하게 설정

## 품질 체크리스트

skill 문서 작성 완료 전 다음을 검증합니다:

```
□ Frontmatter의 name과 description이 올바르게 작성되었는가?
□ description에 트리거 키워드가 포함되어 있는가?
□ Core Technology Stack이 명확히 정의되었는가?
□ 코어 스택 외 기술 사용 시 확인 워크플로우가 있는가?
□ Implementation Workflow 체크리스트가 있는가?
□ 핵심 패턴에 BAD/GOOD 비교 코드 예제가 포함되었는가?
□ 코드 예제가 실무 수준으로 구체적인가?
□ Project Structure가 포함되었는가?
□ Summary Checklist가 있는가?
□ 기존 프로젝트의 CLAUDE.md나 다른 skill과 일관성이 있는가?
```

## 사용 예시

### 예시 1: Backend Skill 생성 요청

사용자: "FastAPI 백엔드 개발 스킬을 만들어줘"

→ 다음을 확인:
1. 필수 기술: FastAPI, SQLAlchemy, Pydantic, Alembic
2. 적용 범위: REST API 개발, DB 모델링, 인증/인가
3. 핵심 패턴: Repository Pattern, Dependency Injection, Service Layer
4. 프로젝트 구조: Clean Architecture 기반

→ `.claude/skills/backend-development.md` 생성

### 예시 2: Testing Skill 생성 요청

사용자: "테스트 작성 가이드라인 스킬을 만들어줘"

→ 다음을 확인:
1. 필수 기술: Vitest/Jest, Testing Library, MSW
2. 적용 범위: 단위 테스트, 통합 테스트, E2E 테스트
3. 핵심 패턴: AAA Pattern, Test Doubles, Fixture Pattern
4. 커버리지 기준: 최소 80%

→ `.claude/skills/testing-strategy.md` 생성

## 주의사항

- 스킬 문서는 **에이전트가 참조하는 가이드라인**이므로 명령형으로 작성합니다
- 너무 일반적인 내용(모든 프로젝트에 해당)보다 **프로젝트 특화된 구체적 가이드라인**을 우선합니다
- 기존 skills 문서와 **일관된 톤과 구조**를 유지합니다
- 코드 예제는 **복사-붙여넣기가 가능한 수준**으로 완성도 있게 작성합니다
