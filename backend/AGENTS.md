# Backend 개발 규칙

이 파일은 백엔드 개발 시 일관성을 유지하기 위한 규칙 모음입니다.
AI(CODEX)와 개발자 모두 이 규칙을 따릅니다.

---

## 1. 패키지 / 레이어 구조

**도메인 기준(Domain-first)** 구조를 사용합니다.

```
com.mymes.backend
├── {domain}/             # 도메인별 최상위 패키지
│   ├── controller/       # REST 컨트롤러
│   ├── service/          # 비즈니스 로직
│   ├── repository/       # JPA Repository
│   ├── entity/           # JPA 엔티티
│   └── dto/              # 요청/응답 DTO
├── common/               # 공통 유틸, 응답 객체, 예외 등
└── security/             # 인증/인가 관련
```

**예시 도메인 목록** (추후 추가 가능)
- `production` — 생산 실적
- `workorder` — 작업 지시
- `planning` — 생산 계획
- `quality` — 품질
- `equipment` — 설비

**규칙**
- 새 기능은 반드시 해당 도메인 패키지 안에 위치시킵니다.
- 두 도메인 이상에서 공통으로 쓰이는 코드는 `common/`으로 분리합니다.
- `security/`는 인증·인가 목적의 코드만 둡니다.

### 레이어 간 호출 규칙
내부 구조는 Controller → Service → Repository 흐름을 따릅니다.

- **Controller**: Service만 호출. Repository 직접 접근 금지.
- **Service**: 비즈니스 로직 담당. 다른 도메인의 Service 호출 가능. 다른 도메인의 Repository 직접 접근 금지.
- **Repository**: DB 접근만 담당. 비즈니스 로직 포함 금지.
- 도메인 간 의존이 복잡해지면 `common/`으로 분리를 검토합니다.

---

## 2. API 설계 규칙

### URL 네이밍
- 복수형 명사 + 소문자 케밥케이스 사용
- `/api/{도메인-복수형}/{id}` 형태

```
GET    /api/work-orders          # 목록
GET    /api/work-orders/{id}     # 단건
POST   /api/work-orders          # 생성
PUT    /api/work-orders/{id}     # 전체 수정
PATCH  /api/work-orders/{id}     # 부분 수정
DELETE /api/work-orders/{id}     # 삭제
```

### HTTP 상태코드
의미에 맞는 상태코드를 사용합니다.

| 상황 | 상태코드 |
|---|---|
| 성공 (조회/수정/삭제) | `200 OK` |
| 성공 (생성) | `201 Created` |
| 잘못된 요청 (검증 실패) | `400 Bad Request` |
| 인증 필요 | `401 Unauthorized` |
| 권한 없음 | `403 Forbidden` |
| 리소스 없음 | `404 Not Found` |
| 충돌 (중복 등) | `409 Conflict` |
| 서버 에러 | `500 Internal Server Error` |

### 공통 응답 래퍼 (`ApiResponse<T>`)
모든 API 응답은 `ApiResponse`로 감쌉니다.

```
// 성공 — 단건
{ "success": true, "data": { ... }, "message": null, "code": null }

// 성공 — 목록 + 페이지네이션
{
  "success": true,
  "data": [ ... ],
  "pagination": { "page": 1, "size": 20, "total": 150 },
  "message": null,
  "code": null
}

// 실패
{ "success": false, "data": null, "message": "작업 지시를 찾을 수 없습니다.", "code": "WORK_ORDER_NOT_FOUND" }
```

공통 패키지 위치:
```
common/
├── response/
│   ├── ApiResponse.java       # 공통 응답 래퍼
│   └── PageResponse.java      # 페이지네이션 정보
└── exception/
    ├── BusinessException.java        # 커스텀 예외 베이스
    ├── ErrorCode.java                # 에러 코드 enum
    └── GlobalExceptionHandler.java   # @RestControllerAdvice
```

---

## 3. 예외 처리 규칙

### 기본 원칙
- 비즈니스 예외는 `BusinessException`을 상속해서 만듭니다.
- 컨트롤러에서 `try-catch` 금지 — 반드시 `GlobalExceptionHandler`가 처리합니다.
- 예외 메시지는 `ErrorCode` enum에서 관리합니다.

### 에러 코드 네이밍
`{도메인}_{상황}` 형태의 UPPER_SNAKE_CASE 사용합니다.

```java
public enum ErrorCode {
    // 공통
    INVALID_INPUT(400, "잘못된 입력값입니다."),
    INTERNAL_SERVER_ERROR(500, "서버 오류가 발생했습니다."),

    // 작업 지시
    WORK_ORDER_NOT_FOUND(404, "작업 지시를 찾을 수 없습니다."),
    WORK_ORDER_ALREADY_STARTED(409, "이미 시작된 작업 지시입니다."),

    // 생산 실적
    PRODUCTION_NOT_FOUND(404, "생산 실적을 찾을 수 없습니다.");

    private final int status;
    private final String message;
}
```

### 예외 사용 예시
```java
// 서비스에서
WorkOrder workOrder = repository.findById(id)
    .orElseThrow(() -> new BusinessException(ErrorCode.WORK_ORDER_NOT_FOUND));
```

---

## 4. 코드 스타일 / 컨벤션

### Lombok
Lombok을 적극 사용합니다.

```java
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
public class WorkOrder { ... }

@Getter
@Builder
public class WorkOrderResponse { ... }

@RequiredArgsConstructor  // 생성자 주입 대신
@Service
public class WorkOrderService { ... }
```

- `@Data` 사용 금지 — 의도치 않은 `equals`/`hashCode` 생성 방지
- Entity에는 `@Setter` 금지 — 변경은 도메인 메서드로만
- 의존성 주입은 `@RequiredArgsConstructor` + `final` 필드 사용

### DTO 네이밍
목적 기준으로 명확하게 네이밍합니다.

**요청 객체와 응답 객체는 반드시 분리합니다.** 같은 필드 구성이더라도 하나의 DTO를 요청/응답 겸용으로 사용하지 않습니다.

| 용도 | 형식 | 예시 |
|---|---|---|
| 생성 요청 | `{Domain}CreateRequest` | `WorkOrderCreateRequest` |
| 수정 요청 | `{Domain}UpdateRequest` | `WorkOrderUpdateRequest` |
| 단건 응답 | `{Domain}Response` | `WorkOrderResponse` |
| 목록 응답 | `{Domain}ListResponse` | `WorkOrderListResponse` |

### Entity ↔ DTO 변환
MapStruct Mapper를 별도 클래스로 분리하고, 서비스에서 호출합니다.

```
{domain}/
├── mapper/
│   └── WorkOrderMapper.java   # @Mapper(componentModel = "spring")
```

```java
// Mapper
@Mapper(componentModel = "spring")
public interface WorkOrderMapper {
    WorkOrderResponse toResponse(WorkOrder entity);
    WorkOrder toEntity(WorkOrderCreateRequest request);
}

// Service에서 사용
@RequiredArgsConstructor
@Service
public class WorkOrderService {
    private final WorkOrderRepository repository;
    private final WorkOrderMapper mapper;

    public WorkOrderResponse getWorkOrder(Long id) {
        WorkOrder entity = repository.findById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.WORK_ORDER_NOT_FOUND));
        return mapper.toResponse(entity);
    }
}
```

### @Transactional
- 서비스 클래스 레벨에 `@Transactional(readOnly = true)` 기본 적용
- 데이터 변경(생성/수정/삭제) 메서드에만 `@Transactional` 오버라이드

```java
@Transactional(readOnly = true)  // 클래스 레벨 기본값
@Service
public class WorkOrderService {

    public WorkOrderResponse getWorkOrder(Long id) { ... }  // readOnly 적용됨

    @Transactional  // 쓰기 메서드만 오버라이드
    public WorkOrderResponse createWorkOrder(WorkOrderCreateRequest request) { ... }
}
```

---

## 5. BaseEntity (공통 엔티티 필드)

모든 엔티티는 `BaseEntity`를 상속합니다.

```java
@Getter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
```

- `@EnableJpaAuditing`을 `BackendApplication`에 추가해야 동작합니다.
- 생성자/수정자 추적이 필요한 경우 `createdBy`, `updatedBy` 필드를 추가합니다.

---

## 6. Soft Delete

모든 도메인에 Soft Delete를 적용합니다. 실제 DB에서 행을 삭제하지 않고 `deletedAt` 필드로 삭제 여부를 관리합니다.

```java
@Getter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@SQLRestriction("deleted_at IS NULL")   // 조회 시 자동 필터링
public abstract class BaseEntity {
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private LocalDateTime deletedAt;

    public void delete() {
        this.deletedAt = LocalDateTime.now();
    }
}
```

**규칙**
- `repository.delete()` 직접 호출 금지 — 반드시 `entity.delete()` 메서드로 소프트 삭제
- `@SQLRestriction`에 의해 `deletedAt IS NULL`인 데이터만 자동 조회됨
- 삭제된 데이터를 포함해 조회해야 할 경우 네이티브 쿼리 또는 별도 Repository 메서드로 처리

### 자동채번(Auto Numbering)과 Soft Delete
- 일련번호·코드 등 자동채번 시 **소프트 삭제된 레코드도 포함**하여 채번해야 함
- `COUNT`, `MAX(sequence)` 등의 채번 쿼리에서 `deletedAt IS NULL` 조건 적용 금지
- 이유: 삭제된 번호가 재사용되면 이력 추적 및 감사(Audit)가 불가능해짐
- 구현 예시: `@Query`나 네이티브 쿼리에서 `@SQLRestriction`을 우회하도록 `allEntries` 전용 Repository 메서드 사용

---

## 7. 입력값 검증 (Validation)

레이어별 검증 책임을 분리합니다.

- **컨트롤러**: 형식 검증 (`@Valid` + Bean Validation)
- **서비스**: 비즈니스 규칙 검증 (`BusinessException` throw)

```java
// Controller — 형식 검증
@PostMapping
public ResponseEntity<ApiResponse<WorkOrderResponse>> create(
        @Valid @RequestBody WorkOrderCreateRequest request) { ... }

// DTO — Bean Validation 어노테이션
@Getter
public class WorkOrderCreateRequest {
    @NotBlank(message = "작업 지시명은 필수입니다.")
    private String name;

    @NotNull(message = "수량은 필수입니다.")
    @Positive(message = "수량은 0보다 커야 합니다.")
    private Integer quantity;
}

// Service — 비즈니스 규칙 검증
if (workOrder.isStarted()) {
    throw new BusinessException(ErrorCode.WORK_ORDER_ALREADY_STARTED);
}
```

`@Valid` 실패 시 발생하는 `MethodArgumentNotValidException`은 `GlobalExceptionHandler`에서 `400 Bad Request`로 처리합니다.

---

## 8. 로깅 규칙

`@Slf4j` (Lombok)를 사용합니다. 레이어별 로그 레벨 기준은 아래와 같습니다.

| 레벨 | 사용 상황 |
|---|---|
| `DEBUG` | 개발 중 상세 디버깅 정보 |
| `INFO` | 주요 비즈니스 이벤트 (작업 지시 시작, 생산 실적 등록 등) |
| `WARN` | 예외 상황이지만 서비스 영향 없음 |
| `ERROR` | 처리되지 않은 예외, 서비스 장애 |

```java
@Slf4j
@Service
public class WorkOrderService {

    @Transactional
    public WorkOrderResponse createWorkOrder(WorkOrderCreateRequest request) {
        log.info("작업 지시 생성 요청: name={}, quantity={}", request.getName(), request.getQuantity());
        // ...
        log.info("작업 지시 생성 완료: id={}", saved.getId());
        return mapper.toResponse(saved);
    }
}
```

**규칙**
- 컨트롤러에서는 로그 금지 — 서비스에서 남깁니다.
- 개인정보 및 민감 데이터는 로그에 포함하지 않습니다.
- `GlobalExceptionHandler`에서 `ERROR` 레벨로 예외 전체를 로깅합니다.

---

## 9. 복잡한 쿼리 처리 (QueryDSL)

단순 CRUD는 Spring Data JPA, 동적 조건 조회는 QueryDSL을 사용합니다.

```
{domain}/
├── repository/
│   ├── WorkOrderRepository.java          # JpaRepository 상속
│   └── WorkOrderRepositoryCustom.java    # QueryDSL 인터페이스
│   └── WorkOrderRepositoryImpl.java      # QueryDSL 구현체
```

```java
// 동적 쿼리 예시
public List<WorkOrder> search(WorkOrderSearchRequest request) {
    return queryFactory
        .selectFrom(workOrder)
        .where(
            statusEq(request.getStatus()),
            createdAtBetween(request.getFrom(), request.getTo())
        )
        .fetch();
}

private BooleanExpression statusEq(WorkOrderStatus status) {
    return status != null ? workOrder.status.eq(status) : null;
}
```

**규칙**
- `@Query` JPQL은 단순 조회에만 허용, 동적 조건이 2개 이상이면 QueryDSL 사용
- QueryDSL 구현체 클래스명은 반드시 `{RepositoryName}Impl` 형태를 따릅니다.

---

## 10. 주석 규칙

메서드·함수 단위로 역할을 설명하는 주석을 반드시 작성합니다.

**형식**
```java
/**
 * [한 줄 요약 — 이 메서드가 무엇을 하는지]
 *
 * @param paramName 파라미터 설명
 * @return 반환값 설명
 * @throws BusinessException 예외 발생 조건
 */
public WorkOrderResponse getWorkOrder(Long id) { ... }
```

**규칙**
- 모든 `public` 메서드에는 Javadoc 주석(`/** */`)을 작성합니다.
- `private` 메서드는 로직이 자명하지 않은 경우에만 `//` 한 줄 주석으로 설명합니다.
- 주석은 **무엇을(what)** 하는지 설명합니다. 코드를 그대로 읽는 주석은 금지합니다.
- 예외 발생 조건이 있으면 `@throws`를 반드시 명시합니다.

```java
// 좋은 예
/**
 * ID로 작업 지시를 단건 조회합니다.
 *
 * @param id 작업 지시 ID
 * @return 작업 지시 응답 DTO
 * @throws BusinessException 작업 지시가 존재하지 않을 경우 (WORK_ORDER_NOT_FOUND)
 */
public WorkOrderResponse getWorkOrder(Long id) { ... }

// 나쁜 예 (코드 반복)
// repository에서 id로 findById 호출 후 없으면 예외 던짐
public WorkOrderResponse getWorkOrder(Long id) { ... }
```

---

## 11. 테스트 전략

Service 단위 테스트 중심으로 작성합니다. Repository는 Mockito로 모킹합니다.

```java
@ExtendWith(MockitoExtension.class)
class WorkOrderServiceTest {

    @InjectMocks
    private WorkOrderService workOrderService;

    @Mock
    private WorkOrderRepository workOrderRepository;

    @Mock
    private WorkOrderMapper workOrderMapper;

    @Test
    @DisplayName("존재하지 않는 작업 지시 조회 시 예외 발생")
    void getWorkOrder_notFound() {
        given(workOrderRepository.findById(1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> workOrderService.getWorkOrder(1L))
            .isInstanceOf(BusinessException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.WORK_ORDER_NOT_FOUND);
    }
}
```

**규칙**
- 테스트 메서드명은 한글로 작성합니다 (`@DisplayName` 활용).
- `given` / `when` / `then` 구조를 주석으로 명시합니다.
- 한 테스트는 하나의 시나리오만 검증합니다.
