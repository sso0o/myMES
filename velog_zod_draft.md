# MES 프로젝트에서 Zod 써보니까 — 폼 검증, 이렇게 정리됐다

> MapStruct, Zustand, TanStack Query에 이어 네 번째 회고다.
> MES 프론트엔드에서 도메인별 폼 8개를 만들면서 Zod + react-hook-form 조합을 어떻게 썼는지,
> z.input / z.output 타입 분리가 왜 필요했는지, 어디서 막혔는지를 순서대로 정리한다.

---

## 왜 Zod였나

처음엔 `react-hook-form`만 썼다. 그런데 검증 로직이 컴포넌트 안에 직접 들어가면 두 가지 문제가 생겼다.

```tsx
// ❌ 검증 로직이 컴포넌트 안에 직접
<input
  {...register('sortOrder', {
    required: '정렬 순서를 입력해주세요',
    min: { value: 1, message: '1 이상이어야 합니다' },
    validate: (v) => Number.isInteger(Number(v)) || '정수만 가능합니다',
  })}
/>
```

- 검증 규칙이 `register()` 안에 흩어져서 재사용이 어렵다
- TypeScript 타입 추론이 약하다 — 검증 후 값이 `string`인지 `number`인지 보장이 안 된다

Zod를 붙이면 스키마를 파일 하나로 분리하고, 검증 후 타입까지 보장받을 수 있다.

```typescript
// ✅ 스키마 파일로 분리, 타입까지 보장
export const itemFormSchema = z.object({
  itemName: z.string().trim().min(1, '품목명을 입력해주세요').max(100, '...'),
  itemTypeId: z.preprocess(emptyStringToUndefined, z.coerce.number().positive('품목구분을 선택해주세요')),
  unit: z.string().trim().min(1, '단위를 선택해주세요'),
})
```

---

## 기본 세팅 — 3개 패키지 연결

```bash
npm install zod react-hook-form @hookform/resolvers
```

```typescript
// 버전 (프로젝트 기준)
"zod": "^4.4.1"
"react-hook-form": "^7.74.0"
"@hookform/resolvers": "^5.2.2"
```

연결 방법은 단순하다. `zodResolver`를 `useForm`의 `resolver`에 넘기면 끝이다.

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(itemFormSchema),
  defaultValues: { itemName: '', unit: '' },
})
```

`handleSubmit`의 콜백은 Zod 검증을 통과한 경우에만 실행된다.
`errors` 객체에는 필드별 에러 메시지가 자동으로 들어온다.

---

## 핵심 — z.input<>과 z.output<> 타입 분리

이게 이 프로젝트에서 Zod를 쓰면서 가장 중요하게 느낀 부분이다.

HTML `<input>`은 **모든 값을 문자열로 반환한다.** 숫자를 입력해도 `"123"` 이지 `123`이 아니다.
그런데 API에는 숫자 타입으로 보내야 한다.

Zod의 `transform`, `coerce`는 이 변환을 스키마 레벨에서 처리한다.
그러면 **입력 시점의 타입**과 **변환 후 타입**이 달라진다. 이걸 분리한 게 `z.input<>`과 `z.output<>`이다.

```typescript
export const commonCodeFormSchema = z.object({
  codeName: z.string().trim().min(1, '코드명을 입력해주세요'),
  sortOrder: z.preprocess(
    emptyStringToUndefined,
    z.coerce.number().int().positive('1 이상이어야 합니다'),
  ),
  groupId: z.string().trim().min(1).transform((v) => v.toUpperCase()),
})

// 입력 시점: 모두 string (HTML input이 string을 줌)
export type CodeGroupFormInput = z.input<typeof commonCodeFormSchema>
// { codeName: string; sortOrder: unknown; groupId: string }

// 변환 후: sortOrder는 number, groupId는 대문자로
export type CodeGroupFormValues = z.output<typeof commonCodeFormSchema>
// { codeName: string; sortOrder: number; groupId: string }
```

`useForm`에 두 타입을 모두 명시한다.

```typescript
const { register, handleSubmit } = useForm<
  CodeGroupFormInput,   // 1번 제네릭: 폼 내부에서 다루는 타입 (Input)
  unknown,              // 2번 제네릭: context (보통 unknown)
  CodeGroupFormValues   // 3번 제네릭: handleSubmit 콜백이 받는 타입 (Output)
>({
  resolver: zodResolver(commonCodeFormSchema),
  defaultValues: { codeName: '', sortOrder: '', groupId: '' },  // Input 타입 기준
})
```

```typescript
// handleSubmit 콜백 — 이미 변환된 Output 타입이 들어옴
const handleFormSubmit = (values: CodeGroupFormValues) => {
  // values.sortOrder는 이미 number
  // values.groupId는 이미 대문자
  api.create(values)
}
```

타입 분리가 없으면 `handleSubmit` 콜백에서 `sortOrder`가 `string | number`가 되거나,
직접 `Number(values.sortOrder)`를 호출해야 한다. Zod가 그 과정을 흡수해준다.

---

## 자주 쓴 Zod 패턴들

### 1. preprocess + coerce — 숫자 필드 처리

HTML input은 빈 값도 `""`(빈 문자열)로 온다. `z.coerce.number()`만 쓰면 `""` → `0`으로 변환돼버린다.
`preprocess`로 빈 문자열을 먼저 `undefined`로 바꿔서 "입력 안 함"과 "0 입력"을 구분했다.

```typescript
const emptyStringToUndefined = (value: unknown) => {
  if (value === '' || value === null) return undefined
  return value
}

// 필수 숫자 필드
sortOrder: z.preprocess(
  emptyStringToUndefined,
  z.coerce.number().int('정수만 입력해주세요').positive('1 이상이어야 합니다'),
)

// 선택 숫자 필드
equipmentTypeId: z.preprocess(
  emptyStringToUndefined,
  z.coerce.number().int().positive('올바르지 않습니다').optional(),
)
```

`z.coerce.number()`는 `"123"` → `123`으로 강제 변환한다. `preprocess`와 함께 쓰면 빈 값 처리도 안전하게 된다.

### 2. transform — 값 가공

검증 통과 후 값을 가공해서 Output에 반영한다.

```typescript
// 입력값을 항상 대문자로
groupId: z.string().trim().min(1).transform((v) => v.toUpperCase())

// 공백만 있으면 undefined로
memo: z.string().max(500).transform((v) => v.trim() || undefined).optional()

// 재사용 가능한 헬퍼로 뽑아두기
const optionalTrimmedString = (max: number, message: string) =>
  z.string().trim().max(max, message).transform((v) => v || undefined)

// 쓸 때
description: optionalTrimmedString(500, '설명은 500자 이하로 입력해주세요')
phone: optionalTrimmedString(30, '연락처는 30자 이하로 입력해주세요')
```

공통 패턴은 헬퍼 함수로 뽑아두니까 스키마 코드가 훨씬 짧아졌다.

### 3. refine — 여러 필드를 함께 검증

한 필드만 봐선 알 수 없고, 여러 필드를 동시에 봐야 하는 검증에 쓴다.
품질 검사 폼에서 "합격수량 + 불량수량 ≤ 검사수량" 조건이 있었다.

```typescript
export const qualityInspectionFormSchema = z
  .object({
    inspectionQty: z.coerce.number().int().min(0),
    passQty: z.coerce.number().int().min(0),
    defectQty: z.coerce.number().int().min(0),
    // ... 나머지 필드
  })
  .refine(
    (values) => values.passQty + values.defectQty <= values.inspectionQty,
    {
      path: ['defectQty'],  // 에러를 어느 필드에 붙일지
      message: '합격수량과 불량수량의 합은 검사수량을 초과할 수 없습니다.',
    }
  )
```

`path`를 지정하면 에러가 특정 필드에 붙어서 `errors.defectQty.message`로 꺼낼 수 있다.

### 4. superRefine — 조건부 필수 필드

`refine`보다 복잡한 조건이 필요할 때 쓴다. 여러 이슈를 동시에 추가할 수 있고, 분기 처리도 자유롭다.
작업자 폼에서 "퇴사 상태를 선택하면 퇴사일은 필수"였다.

```typescript
export const workerFormSchema = z
  .object({
    status: z.enum([WorkerStatus.ACTIVE, WorkerStatus.ON_LEAVE, WorkerStatus.RESIGNED]),
    resignedAt: optionalDate,
    // ... 나머지 필드
  })
  .superRefine((values, ctx) => {
    if (values.status === WorkerStatus.RESIGNED && !values.resignedAt) {
      ctx.addIssue({
        code: 'custom',
        path: ['resignedAt'],
        message: '퇴사 상태는 퇴사일을 입력해주세요',
      })
    }
  })
```

`superRefine`은 `ctx.addIssue()`로 에러를 직접 추가한다.
조건이 복잡하거나 이슈를 여러 필드에 동시에 붙여야 할 때 `refine`보다 유연하다.

### 5. z.enum — 선택지 제한

TypeScript enum이나 as const 상수와 함께 쓰면 허용되지 않는 값이 들어오는 걸 막는다.

```typescript
inspectionType: z.enum([
  QualityInspectionType.INCOMING,
  QualityInspectionType.IN_PROCESS,
  QualityInspectionType.FINAL,
], { error: '검사유형을 선택해주세요.' })

status: z.enum([WorkerStatus.ACTIVE, WorkerStatus.ON_LEAVE, WorkerStatus.RESIGNED])
```

### 6. regex — 날짜 형식 검증

`<input type="date">`가 항상 올바른 형식을 보장하지는 않는다. 직접 regex로 형식을 체크했다.

```typescript
const optionalDate = z.preprocess(
  emptyStringToUndefined,
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다').optional(),
)
```

---

## react-hook-form 연동 패턴

### 기본 필드 — register

```tsx
<AppTextField
  {...register('itemName')}
  placeholder="품목명을 입력하세요"
/>
{errors.itemName && <p className="text-xs text-red-500">{errors.itemName.message}</p>}
```

### Select 같은 커스텀 컴포넌트 — Controller

`register`는 `ref`, `onChange`, `onBlur`, `name`을 연결하는데, MUI Select처럼 ref를 다르게 처리하는 컴포넌트엔 맞지 않는다. 이럴 때 `Controller`를 쓴다.

```tsx
<Controller
  name="status"
  control={control}
  render={({ field }) => (
    <AppSelect {...field} value={field.value}>
      <AppMenuItem value={WorkerStatus.ACTIVE}>재직</AppMenuItem>
      <AppMenuItem value={WorkerStatus.ON_LEAVE}>휴직</AppMenuItem>
      <AppMenuItem value={WorkerStatus.RESIGNED}>퇴사</AppMenuItem>
    </AppSelect>
  )}
/>
{errors.status && <p>{errors.status.message}</p>}
```

### 특정 필드 값 감시 — useWatch

다른 필드의 값에 따라 UI가 바뀌어야 할 때 `useWatch`를 쓴다.
`watch()`는 호출할 때마다 폼 전체를 구독해서 불필요한 리렌더링이 생긴다. `useWatch`는 해당 필드만 구독한다.

```tsx
// ❌ watch — 폼 전체 구독
const status = watch('status')

// ✅ useWatch — 해당 필드만 구독
const status = useWatch({ control, name: 'status' })

// 상태가 퇴사일 때만 퇴사일 필드 렌더링
{status === WorkerStatus.RESIGNED && (
  <div>
    <label>퇴사일 *</label>
    <AppTextField type="date" {...register('resignedAt')} />
    {errors.resignedAt && <p>{errors.resignedAt.message}</p>}
  </div>
)}
```

품질 검사 폼에서는 `workOrderId`가 바뀌면 `itemId`와 `processId`를 자동으로 채워야 했다.

```typescript
const selectedWorkOrderId = useWatch({ control, name: 'workOrderId' })

useEffect(() => {
  if (!selectedWorkOrderId) return
  const selected = workOrders.find((wo) => wo.id === Number(selectedWorkOrderId))
  if (!selected) return

  // setValue로 다른 필드에 값 주입
  setValue('itemId', selected.itemId, { shouldValidate: true })
  setValue('processId', selected.processId ?? '', { shouldValidate: true })
}, [selectedWorkOrderId, workOrders, setValue])
```

`shouldValidate: true` 옵션을 주면 값을 세팅하면서 즉시 검증도 트리거된다.

---

## 트러블슈팅

### 1. 숫자 필드인데 타입이 string이라 API에서 에러

`<input type="number">`도 `register`를 거치면 `string`을 반환한다.
처음엔 이걸 모르고 그냥 썼다가 API에서 타입 에러가 났다.

```typescript
// ❌ z.number()만 쓰면 HTML input의 string을 못 받음
itemTypeId: z.number().positive('품목구분을 선택해주세요')

// ✅ z.coerce.number()로 string → number 강제 변환
itemTypeId: z.preprocess(
  emptyStringToUndefined,
  z.coerce.number().positive('품목구분을 선택해주세요')
)
```

`z.number()`는 처음부터 `number` 타입이어야 통과한다.
HTML input에서 오는 값은 항상 `string`이라 `z.coerce.number()` 또는 `z.preprocess`가 필요하다.

### 2. useForm에 Input/Output 타입을 안 나눴을 때

타입을 하나만 쓰면 `defaultValues`와 `handleSubmit` 콜백 사이에 타입 충돌이 생긴다.

```typescript
// ❌ 타입 하나만 쓰면
useForm<ItemFormValues>({ defaultValues: { itemTypeId: '' } })
// ⚡ 에러: '' (string)은 number에 할당할 수 없음

// ✅ Input/Output 분리
useForm<ItemFormInput, unknown, ItemFormValues>({
  defaultValues: { itemTypeId: '' },  // Input 기준 — string OK
})
// handleSubmit 콜백에서 values.itemTypeId는 number
```

`defaultValues`는 Input 타입 기준, `handleSubmit` 콜백은 Output 타입 기준으로 동작한다.

### 3. transform 후 undefined가 되면 optional 처리 순서 주의

`transform`으로 빈 문자열을 `undefined`로 만들 때, `.optional()`을 붙이는 순서가 중요하다.

```typescript
// ❌ optional을 먼저 붙이면 transform이 optional 타입에 적용됨
z.string().optional().transform((v) => v || undefined)

// ✅ transform 후 optional
z.string().max(500).transform((v) => v.trim() || undefined).optional()
```

Zod는 체이닝 순서대로 처리하기 때문에, `transform` 다음에 `.optional()`을 붙여야 변환 결과가 `undefined`여도 통과된다.

### 4. superRefine vs refine 선택 기준

처음엔 둘의 차이를 몰라서 헷갈렸다.

`refine`은 단일 조건 하나를 체크하고 실패 시 에러 하나를 추가한다.

```typescript
.refine(
  (values) => values.passQty + values.defectQty <= values.inspectionQty,
  { path: ['defectQty'], message: '...' }
)
```

`superRefine`은 컨텍스트(`ctx`)를 받아서 조건에 따라 여러 에러를 선택적으로 추가할 수 있다.

```typescript
.superRefine((values, ctx) => {
  if (조건1) ctx.addIssue({ path: ['field1'], message: '...' })
  if (조건2) ctx.addIssue({ path: ['field2'], message: '...' })
})
```

단순한 다중 필드 검증은 `refine`, 분기가 복잡하거나 에러를 여러 필드에 동시에 붙여야 하면 `superRefine`.

---

## 프로젝트에서 정착된 스키마 파일 구조

```
features/{domain}/schemas/{domain}Schema.ts
```

파일 안엔 이 순서로 작성했다.

```typescript
// 1. 재사용 헬퍼 함수
const emptyStringToUndefined = (value: unknown) => ...
const optionalTrimmedString = (max: number, message: string) => ...

// 2. 스키마 정의
export const itemFormSchema = z.object({ ... })

// 3. 타입 export — Input/Output 분리
export type ItemFormInput = z.input<typeof itemFormSchema>
export type ItemFormValues = z.output<typeof itemFormSchema>
```

스키마 파일이 컴포넌트 폴더와 분리되어 있어서, 검증 로직을 바꿀 때 컴포넌트를 열 필요가 없었다.

---

## 정리하면

| 상황 | 방법 |
|---|---|
| 숫자 필드 (HTML input은 string 반환) | `z.coerce.number()` 또는 `preprocess + coerce` |
| 빈 문자열 → undefined 처리 | `preprocess(emptyStringToUndefined, ...)` |
| 값 가공 (대문자, trim) | `.transform()` |
| 여러 필드 조합 검증 | `.refine()` |
| 조건부 필수 / 복잡한 분기 | `.superRefine()` |
| 폼 기본값과 API 전송 타입이 다를 때 | `z.input<>` / `z.output<>` 분리 |
| Select 같은 커스텀 컴포넌트 | `Controller` |
| 특정 필드 값 감시 | `useWatch` (watch 대신) |

Zod를 쓰기 전엔 검증 로직이 컴포넌트 안에 흩어져 있었다.
스키마 파일로 분리하고 나니 폼 로직과 검증 로직이 명확하게 나뉘었고,
`z.input<>` / `z.output<>` 타입 분리 덕분에 "폼에서 받은 값을 API에 보내기 전에 변환"하는 과정이 타입 시스템 안으로 들어왔다.
처음에 `preprocess`와 `coerce` 조합이 낯설었는데, 한 번 패턴을 잡고 나니 새 도메인 폼을 추가할 때 거의 복붙 수준으로 빠르게 만들 수 있었다.
