---
name: new-domain
description: 새로운 도메인 생성 시 사용. 백엔드 개발 규칙에 따라 CRUD API 전체 구조(Entity, Repository, Service, Controller, DTO, Mapper, 테스트)를 생성한다.
---

## 프로젝트 기본 정보
- **언어**: Java
- **프레임워크**: Spring Boot
- **DB / 권한**: Supabase
- **베이스 패키지**: `com.mymes.backend`

---

## 패키지 구조

```
com.mymes.backend
└── {domain}/
    ├── controller/
    ├── service/
    ├── repository/
    │   ├── {Domain}Repository.java
    │   ├── {Domain}RepositoryCustom.java    # 동적 쿼리 필요 시
    │   └── {Domain}RepositoryImpl.java      # 동적 쿼리 필요 시
    ├── entity/
    ├── mapper/
    │   └── {Domain}Mapper.java
    └── dto/
        ├── request/
        │   ├── {Domain}CreateRequest.java
        │   └── {Domain}UpdateRequest.java
        └── response/
            ├── {Domain}Response.java
            └── {Domain}ListResponse.java    # 목록 조회 필요 시
```

공통 패키지 위치 (이미 존재, 새로 만들지 않음):
```
common/
├── response/
│   ├── ApiResponse.java
│   └── PageResponse.java
└── exception/
    ├── BusinessException.java
    ├── ErrorCode.java
    └── GlobalExceptionHandler.java
```

---

## 레이어 간 호출 규칙

- **Controller** → Service만 호출. Repository 직접 접근 금지. 로그 작성 금지.
- **Service** → 비즈니스 로직 담당. 다른 도메인의 Service 호출 가능. 다른 도메인의 Repository 직접 접근 금지.
- **Repository** → DB 접근만 담당. 비즈니스 로직 포함 금지.
- 도메인 간 의존이 복잡해지면 `common/`으로 분리를 검토한다.

---

## 각 레이어 작성 규칙

### Entity
- `BaseEntity` 반드시 상속 (`createdAt`, `updatedAt`, `deletedAt`, `delete()` 포함)
- `@NoArgsConstructor(access = AccessLevel.PROTECTED)` 필수
- `@Setter` 금지 — 변경은 도메인 메서드로만
- `@Data` 사용 금지
- Lombok: `@Getter`만 적용

```java
@Entity
@Table(name = "{테이블명}")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WorkOrder extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    private Integer quantity;

    @Builder
    private WorkOrder(String name, Integer quantity) {
        this.name = name;
        this.quantity = quantity;
    }
}
```

### Repository
- `JpaRepository<Entity, ID>` 상속, 인터페이스로만 선언
- 동적 조건이 2개 이상이면 QueryDSL 사용 (`RepositoryCustom` + `RepositoryImpl` 분리)
- `@Query` JPQL은 단순 조회에만 허용

```java
public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {
}
```

### Mapper
- MapStruct 사용, `@Mapper(componentModel = "spring")`
- Entity ↔ DTO 변환은 반드시 Mapper 클래스로 분리
- 서비스에서 직접 변환 금지

```java
@Mapper(componentModel = "spring")
public interface WorkOrderMapper {
    WorkOrderResponse toResponse(WorkOrder entity);
    WorkOrder toEntity(WorkOrderCreateRequest request);
}
```

### Service
- `@Transactional(readOnly = true)` 클래스 레벨 기본 적용
- 데이터 변경 메서드에만 `@Transactional` 오버라이드
- `@RequiredArgsConstructor` + `final` 필드로 의존성 주입
- `@Slf4j` 로그: INFO 레벨로 주요 비즈니스 이벤트 기록
- 삭제는 `repository.delete()` 직접 호출 금지 — `entity.delete()` 소프트 삭제 사용
- 비즈니스 규칙 검증은 서비스에서 `BusinessException` throw

```java
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WorkOrderService {

    private final WorkOrderRepository workOrderRepository;
    private final WorkOrderMapper workOrderMapper;

    /**
     * ID로 작업 지시를 단건 조회합니다.
     *
     * @param id 작업 지시 ID
     * @return 작업 지시 응답 DTO
     * @throws BusinessException 작업 지시가 존재하지 않을 경우 (WORK_ORDER_NOT_FOUND)
     */
    public WorkOrderResponse getWorkOrder(Long id) {
        WorkOrder entity = workOrderRepository.findById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.WORK_ORDER_NOT_FOUND));
        return workOrderMapper.toResponse(entity);
    }

    /**
     * 작업 지시를 생성합니다.
     *
     * @param request 생성 요청 DTO
     * @return 생성된 작업 지시 응답 DTO
     */
    @Transactional
    public WorkOrderResponse createWorkOrder(WorkOrderCreateRequest request) {
        log.info("작업 지시 생성 요청: name={}, quantity={}", request.getName(), request.getQuantity());
        WorkOrder entity = workOrderMapper.toEntity(request);
        WorkOrder saved = workOrderRepository.save(entity);
        log.info("작업 지시 생성 완료: id={}", saved.getId());
        return workOrderMapper.toResponse(saved);
    }

    /**
     * 작업 지시를 수정합니다.
     *
     * @param id 작업 지시 ID
     * @param request 수정 요청 DTO
     * @return 수정된 작업 지시 응답 DTO
     * @throws BusinessException 작업 지시가 존재하지 않을 경우 (WORK_ORDER_NOT_FOUND)
     */
    @Transactional
    public WorkOrderResponse updateWorkOrder(Long id, WorkOrderUpdateRequest request) {
        WorkOrder entity = workOrderRepository.findById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.WORK_ORDER_NOT_FOUND));
        // 도메인 메서드로 변경
        return workOrderMapper.toResponse(entity);
    }

    /**
     * 작업 지시를 소프트 삭제합니다.
     *
     * @param id 작업 지시 ID
     * @throws BusinessException 작업 지시가 존재하지 않을 경우 (WORK_ORDER_NOT_FOUND)
     */
    @Transactional
    public void deleteWorkOrder(Long id) {
        WorkOrder entity = workOrderRepository.findById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.WORK_ORDER_NOT_FOUND));
        entity.delete();
        log.info("작업 지시 삭제 완료: id={}", id);
    }
}
```

### Controller
- `@RestController`, `@RequiredArgsConstructor`, `@RequestMapping("/api/{domain-plural-kebab}")` 적용
- Repository 직접 주입 금지, 로그 작성 금지, `try-catch` 금지
- 모든 응답은 `ApiResponse`로 래핑
- 생성 성공 시 `201 Created`, 나머지는 `200 OK`

```java
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/work-orders")
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkOrderResponse>> getWorkOrder(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(workOrderService.getWorkOrder(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WorkOrderResponse>> createWorkOrder(
            @Valid @RequestBody WorkOrderCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(workOrderService.createWorkOrder(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkOrderResponse>> updateWorkOrder(
            @PathVariable Long id,
            @Valid @RequestBody WorkOrderUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(workOrderService.updateWorkOrder(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteWorkOrder(@PathVariable Long id) {
        workOrderService.deleteWorkOrder(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
```

### DTO
- 요청/응답 DTO 반드시 분리 (겸용 금지)
- Request DTO: Bean Validation 어노테이션으로 형식 검증 (비즈니스 규칙은 서비스에서)
- Lombok: `@Getter`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@Builder`

```java
// Request
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrderCreateRequest {

    @NotBlank(message = "작업 지시명은 필수입니다.")
    private String name;

    @NotNull(message = "수량은 필수입니다.")
    @Positive(message = "수량은 0보다 커야 합니다.")
    private Integer quantity;
}

// Response
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrderResponse {
    private Long id;
    private String name;
    private Integer quantity;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### ErrorCode 추가
새 도메인 생성 시 `ErrorCode` enum에 해당 도메인 에러코드를 추가한다. 네이밍은 `{DOMAIN}_{상황}` UPPER_SNAKE_CASE.

```java
{DOMAIN}_NOT_FOUND(404, "{도메인명}을 찾을 수 없습니다."),
{DOMAIN}_ALREADY_EXISTED(409, "이미 존재하는 {도메인명}입니다."),
```

---

## 주석 규칙

- 모든 `public` 메서드에 Javadoc(`/** */`) 필수
- `private` 메서드는 로직이 자명하지 않은 경우에만 `//` 한 줄 주석
- **무엇을(what)** 하는지 설명, 코드를 그대로 읽는 주석 금지
- 예외 발생 조건이 있으면 `@throws` 반드시 명시

---

## 테스트 작성 규칙

Service 단위 테스트 중심, Repository는 Mockito로 모킹.

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
        // given
        given(workOrderRepository.findById(1L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> workOrderService.getWorkOrder(1L))
            .isInstanceOf(BusinessException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.WORK_ORDER_NOT_FOUND);
    }
}
```

- 테스트 메서드명은 한글로 작성 (`@DisplayName` 활용)
- `given` / `when` / `then` 구조 주석으로 명시
- 한 테스트는 하나의 시나리오만 검증

---

## 생성 체크리스트

- [ ] 패키지 구조가 규칙에 맞는가
- [ ] Entity가 `BaseEntity`를 상속하는가
- [ ] Entity에 `@Setter` 없는가
- [ ] 삭제는 `entity.delete()` 소프트 삭제인가 (`repository.delete()` 금지)
- [ ] Mapper가 별도 클래스로 분리됐는가
- [ ] Service에 `@Transactional(readOnly = true)` 기본 적용됐는가
- [ ] 컨트롤러에서 Repository 직접 주입하지 않았는가
- [ ] 컨트롤러에 로그, `try-catch` 없는가
- [ ] Request DTO에 Bean Validation 어노테이션 추가됐는가
- [ ] 요청/응답 DTO가 분리됐는가
- [ ] 생성 API는 `201 Created` 반환하는가
- [ ] 모든 응답이 `ApiResponse`로 래핑됐는가
- [ ] `ErrorCode`에 해당 도메인 에러코드 추가됐는가
- [ ] 모든 `public` 메서드에 Javadoc 주석이 있는가
- [ ] Service 단위 테스트가 작성됐는가








