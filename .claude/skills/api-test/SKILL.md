---
name: api-test
description: Service 단위 테스트 생성 시 사용. 대상 Service 클래스를 분석해 happy path + 예외 케이스 테스트를 백엔드 개발 규칙에 맞게 작성한다.
---

## 기본 정보
- **테스트 대상**: Service 레이어 단위 테스트
- **테스트 프레임워크**: JUnit5 + Mockito
- **테스트 파일 위치**: `src/test/java/com/mymes/backend/{domain}/`

---

## 테스트 클래스 구조

```java
@ExtendWith(MockitoExtension.class)
class {Domain}ServiceTest {

    @InjectMocks
    private {Domain}Service {domain}Service;

    @Mock
    private {Domain}Repository {domain}Repository;

    @Mock
    private {Domain}Mapper {domain}Mapper;

    // 테스트 픽스처 (공통으로 쓰이는 엔티티/DTO는 필드로 선언)
}
```

---

## 테스트 케이스 기준

대상 Service의 모든 `public` 메서드에 대해 아래 두 가지를 작성한다.

### 1. Happy Path — 정상 동작
- 정상 입력 시 기댓값 반환 여부 확인
- Mock 호출 횟수 검증 (`verify`)

### 2. 예외 케이스 — 실패 시나리오
- 존재하지 않는 ID 조회 → `BusinessException` + 올바른 `ErrorCode` 검증
- 비즈니스 규칙 위반 시 적절한 `ErrorCode` 검증
- 예외가 발생해야 하는 모든 분기 커버

---

## 작성 규칙

- `@DisplayName`은 한글로, **시나리오 중심**으로 작성 (예: "존재하지 않는 ID로 조회 시 예외 발생")
- `given` / `when` / `then` 구조를 주석으로 명시
- 한 테스트는 하나의 시나리오만 검증
- 테스트 메서드명: `{메서드명}_{시나리오}` (예: `getWorkOrder_notFound`)
- `@Nested`로 메서드별 테스트 그룹화
- 공통 픽스처는 `@BeforeEach`로 세팅

---

## 테스트 템플릿

```java
@ExtendWith(MockitoExtension.class)
class WorkOrderServiceTest {

    @InjectMocks
    private WorkOrderService workOrderService;

    @Mock
    private WorkOrderRepository workOrderRepository;

    @Mock
    private WorkOrderMapper workOrderMapper;

    private WorkOrder workOrder;
    private WorkOrderResponse workOrderResponse;

    @BeforeEach
    void setUp() {
        workOrder = WorkOrder.builder()
            .name("테스트 작업지시")
            .quantity(10)
            .build();

        workOrderResponse = WorkOrderResponse.builder()
            .id(1L)
            .name("테스트 작업지시")
            .quantity(10)
            .build();
    }

    @Nested
    @DisplayName("단건 조회")
    class GetWorkOrder {

        @Test
        @DisplayName("정상적으로 작업 지시를 조회한다")
        void getWorkOrder_success() {
            // given
            given(workOrderRepository.findById(1L)).willReturn(Optional.of(workOrder));
            given(workOrderMapper.toResponse(workOrder)).willReturn(workOrderResponse);

            // when
            WorkOrderResponse result = workOrderService.getWorkOrder(1L);

            // then
            assertThat(result.getId()).isEqualTo(1L);
            assertThat(result.getName()).isEqualTo("테스트 작업지시");
            verify(workOrderRepository, times(1)).findById(1L);
        }

        @Test
        @DisplayName("존재하지 않는 ID로 조회 시 예외 발생")
        void getWorkOrder_notFound() {
            // given
            given(workOrderRepository.findById(1L)).willReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> workOrderService.getWorkOrder(1L))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.WORK_ORDER_NOT_FOUND);

            verify(workOrderRepository, times(1)).findById(1L);
        }
    }

    @Nested
    @DisplayName("생성")
    class CreateWorkOrder {

        @Test
        @DisplayName("정상적으로 작업 지시를 생성한다")
        void createWorkOrder_success() {
            // given
            WorkOrderCreateRequest request = WorkOrderCreateRequest.builder()
                .name("새 작업지시")
                .quantity(5)
                .build();

            given(workOrderMapper.toEntity(request)).willReturn(workOrder);
            given(workOrderRepository.save(workOrder)).willReturn(workOrder);
            given(workOrderMapper.toResponse(workOrder)).willReturn(workOrderResponse);

            // when
            WorkOrderResponse result = workOrderService.createWorkOrder(request);

            // then
            assertThat(result).isNotNull();
            verify(workOrderRepository, times(1)).save(any(WorkOrder.class));
        }
    }

    @Nested
    @DisplayName("수정")
    class UpdateWorkOrder {

        @Test
        @DisplayName("정상적으로 작업 지시를 수정한다")
        void updateWorkOrder_success() {
            // given
            WorkOrderUpdateRequest request = WorkOrderUpdateRequest.builder()
                .name("수정된 작업지시")
                .build();

            given(workOrderRepository.findById(1L)).willReturn(Optional.of(workOrder));
            given(workOrderMapper.toResponse(workOrder)).willReturn(workOrderResponse);

            // when
            WorkOrderResponse result = workOrderService.updateWorkOrder(1L, request);

            // then
            assertThat(result).isNotNull();
            verify(workOrderRepository, times(1)).findById(1L);
        }

        @Test
        @DisplayName("존재하지 않는 작업 지시 수정 시 예외 발생")
        void updateWorkOrder_notFound() {
            // given
            WorkOrderUpdateRequest request = WorkOrderUpdateRequest.builder()
                .name("수정된 작업지시")
                .build();

            given(workOrderRepository.findById(1L)).willReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> workOrderService.updateWorkOrder(1L, request))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.WORK_ORDER_NOT_FOUND);
        }
    }

    @Nested
    @DisplayName("삭제")
    class DeleteWorkOrder {

        @Test
        @DisplayName("정상적으로 작업 지시를 소프트 삭제한다")
        void deleteWorkOrder_success() {
            // given
            given(workOrderRepository.findById(1L)).willReturn(Optional.of(workOrder));

            // when
            workOrderService.deleteWorkOrder(1L);

            // then
            verify(workOrderRepository, times(1)).findById(1L);
            // entity.delete() 호출 여부는 deletedAt 필드로 검증
        }

        @Test
        @DisplayName("존재하지 않는 작업 지시 삭제 시 예외 발생")
        void deleteWorkOrder_notFound() {
            // given
            given(workOrderRepository.findById(1L)).willReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> workOrderService.deleteWorkOrder(1L))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.WORK_ORDER_NOT_FOUND);
        }
    }
}
```

---

## 생성 체크리스트

- [ ] `@Nested`로 메서드별 그룹화됐는가
- [ ] `@DisplayName`이 한글 시나리오 중심으로 작성됐는가
- [ ] `given` / `when` / `then` 주석이 있는가
- [ ] 모든 `public` 메서드에 happy path 테스트가 있는가
- [ ] `BusinessException`을 던지는 모든 분기에 예외 케이스 테스트가 있는가
- [ ] `verify`로 Mock 호출 횟수를 검증했는가
- [ ] 공통 픽스처는 `@BeforeEach`로 분리됐는가
- [ ] 한 테스트가 하나의 시나리오만 검증하는가