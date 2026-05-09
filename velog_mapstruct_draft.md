# MES 프로젝트에서 MapStruct 써보니까 — Entity → DTO 변환, 이렇게 정리됐다

> MES(제조 실행 시스템) 사이드 프로젝트를 진행하면서 MapStruct를 처음 제대로 도입해봤다.
> 이 글은 "왜 썼나"부터 "어노테이션은 뭔데", "실제로 어떻게 썼나", "쓰다가 막혔던 것"까지 경험 순서대로 정리한 회고다.

---

## 왜 MapStruct를 쓰게 됐나

Spring Boot + JPA 조합으로 개발하다 보면 Entity를 그대로 Response로 내려주고 싶은 충동이 생긴다.
처음엔 그냥 `@JsonIgnore` 몇 개 붙이면 되지 않을까 싶었는데, 막상 써보니 문제가 쌓인다.

- 연관 관계 Entity들이 줄줄이 딸려 직렬화됨
- 클라이언트에 불필요한 정보까지 노출됨
- 필드 하나 바꾸면 API 응답 구조가 통째로 바뀜

결국 Entity와 DTO를 분리했는데, 이걸 수동으로 변환하면 이런 코드가 도메인마다 반복된다.

```java
// 이런 걸 도메인마다 직접 짜야 했다
public EquipmentResponse toResponse(Equipment equipment) {
    return EquipmentResponse.builder()
            .id(equipment.getId())
            .equipmentCode(equipment.getEquipmentCode())
            .equipmentName(equipment.getEquipmentName())
            .equipmentTypeId(equipment.getEquipmentType().getId())
            .equipmentTypeName(equipment.getEquipmentType().getCodeName())
            .isActive(equipment.isActive())
            // ...
            .build();
}
```

도메인이 14개였는데 이걸 전부 수작업으로 유지하고 싶지 않았다.
ModelMapper도 고려했지만, 런타임 리플렉션 기반이라 성능 오버헤드가 있고 타입 안정성도 낮다는 점이 마음에 걸렸다.
MapStruct는 **컴파일 타임에 구현 코드를 자동 생성**해주기 때문에, 런타임 비용도 없고 타입 오류도 빌드 시점에 잡힌다.

---

## 의존성 설정 — Lombok이랑 같이 쓸 때 순서가 중요하다

`build.gradle`에 이렇게 추가했다.

```gradle
dependencies {
    // MapStruct
    implementation 'org.mapstruct:mapstruct:1.6.3'
    annotationProcessor 'org.mapstruct:mapstruct-processor:1.6.3'

    // Lombok과 함께 쓸 때 필수
    annotationProcessor 'org.projectlombok:lombok-mapstruct-binding:0.2.0'

    // Lombok (위치 주의)
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
}
```

**`lombok-mapstruct-binding`이 없으면** Lombok이 생성한 getter/setter를 MapStruct가 못 읽는 경우가 생긴다.
annotationProcessor 처리 순서 문제인데, 이 바인딩 라이브러리가 순서를 보장해준다.
처음에 이걸 빠뜨렸다가 컴파일 에러는 안 나는데 매핑이 null로 떨어지는 현상을 겪었다. (아래 트러블슈팅에서 상세히)

---

## 핵심 어노테이션 3가지

### `@Mapper(componentModel = "spring")`

Mapper 인터페이스에 붙이는 어노테이션. `componentModel = "spring"`을 지정하면
MapStruct가 생성하는 구현 클래스에 `@Component`를 붙여줘서 Spring Bean으로 자동 등록된다.
덕분에 Service에서 `@Autowired`나 생성자 주입으로 그냥 받아 쓸 수 있다.

```java
@Mapper(componentModel = "spring")
public interface ItemMapper {
    // ...
}
```

### `@Mapping(source = "...", target = "...")`

필드명이 다르거나, 중첩된 객체의 필드를 평탄화(flatten)할 때 사용한다.

```java
// source: Entity의 경로 / target: DTO의 필드명
@Mapping(source = "itemType.id", target = "itemTypeId")
@Mapping(source = "itemType.codeName", target = "itemTypeName")
ItemResponse toResponse(Item item);
```

`source`는 `.`으로 중첩 탐색이 가능하다. `item.itemType.id`처럼 깊이 들어갈 수도 있다.

### 메서드 선언

변환 메서드는 인터페이스에 선언만 해두면 된다.
MapStruct가 컴파일 시점에 구현 클래스(`*MapperImpl.java`)를 자동 생성한다.

```java
DTOResponse toResponse(Entity entity);
List<DTOResponse> toResponseList(List<Entity> entities);
```

---

## 실제 프로젝트에서 이렇게 썼다

프로젝트에는 14개 도메인이 있었는데, 케이스별로 나눠서 설명한다.

### 케이스 1 — 필드명이 완전히 일치할 때 (가장 단순)

`Worker` 엔티티는 응답 DTO와 필드명이 모두 일치했다.
이 경우 `@Mapping` 없이 메서드 선언만으로 자동 매핑된다.

```java
@Mapper(componentModel = "spring")
public interface WorkerMapper {
    WorkerResponse toResponse(Worker worker);
}
```

내부적으로 MapStruct는 이런 코드를 생성한다.

```java
// 컴파일 후 build/generated/.../WorkerMapperImpl.java
@Component
public class WorkerMapperImpl implements WorkerMapper {
    @Override
    public WorkerResponse toResponse(Worker worker) {
        if (worker == null) return null;
        return WorkerResponse.builder()
                .id(worker.getId())
                .workerCode(worker.getWorkerCode())
                .workerName(worker.getWorkerName())
                // ...
                .build();
    }
}
```

### 케이스 2 — 연관 엔티티 필드를 평탄화할 때

`Item` 엔티티는 `CommonCode`를 `@ManyToOne`으로 가지고 있다.
응답 DTO에는 `itemTypeId`, `itemTypeCode`, `itemTypeName`으로 꺼내야 했다.

```java
// Entity
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "item_type_id")
private CommonCode itemType;
```

```java
// Mapper
@Mapper(componentModel = "spring")
public interface ItemMapper {

    @Mapping(source = "itemType.id", target = "itemTypeId")
    @Mapping(source = "itemType.code", target = "itemTypeCode")
    @Mapping(source = "itemType.codeName", target = "itemTypeName")
    ItemResponse toResponse(Item item);
}
```

`BomMapper`는 더 복잡했다. 부모 품목, 자재 품목, BOM 버전까지 3개의 연관 엔티티를 동시에 펼쳐야 했다.

```java
@Mapper(componentModel = "spring")
public interface BomMapper {

    @Mapping(source = "parentItem.id", target = "parentItemId")
    @Mapping(source = "parentItem.itemCode", target = "parentItemCode")
    @Mapping(source = "parentItem.itemName", target = "parentItemName")
    @Mapping(source = "materialItem.id", target = "materialItemId")
    @Mapping(source = "materialItem.itemCode", target = "materialItemCode")
    @Mapping(source = "materialItem.itemName", target = "materialItemName")
    @Mapping(source = "materialItem.itemType.codeName", target = "materialItemTypeName")
    @Mapping(source = "materialItem.unit", target = "unit")
    @Mapping(source = "bomVersion.id", target = "versionId")
    @Mapping(source = "bomVersion.versionNo", target = "versionNo")
    @Mapping(source = "bomVersion.status", target = "versionStatus")
    BomResponse toResponse(Bom bom);

    BomVersionResponse toVersionResponse(BomVersion bomVersion);
}
```

`source = "materialItem.itemType.codeName"` 처럼 중첩을 3단계까지 타고 들어가는 것도 된다.

### 케이스 3 — `default` 메서드로 복잡한 로직 처리

`DefectMapper`는 일반적인 `@Mapping`으로 처리하기 어려운 케이스였다.
불량 기록이 작업 지시(`WorkOrder`)에 연결될 수도 있고, 품질 검사(`QualityInspection`)에 연결될 수도 있어서,
어디에서 품목과 공정을 꺼내야 할지 조건 분기가 필요했다.

이럴 때는 인터페이스의 `default` 메서드를 쓴다.

```java
@Mapper(componentModel = "spring")
public interface DefectMapper {

    default DefectResponse toResponse(DefectRecord defect) {
        WorkOrder workOrder = defect.getWorkOrder();
        QualityInspection inspection = defect.getQualityInspection();

        // 연결 관계에 따라 품목/공정을 다르게 꺼냄
        Item item = resolveItem(workOrder, inspection);
        MfgProcess process = resolveProcess(workOrder, inspection);

        return DefectResponse.builder()
                .id(defect.getId())
                .workOrderId(workOrder != null ? workOrder.getId() : null)
                .itemId(item != null ? item.getId() : null)
                .itemName(item != null ? item.getItemName() : null)
                .processId(process != null ? process.getId() : null)
                // ...
                .build();
    }

    private Item resolveItem(WorkOrder workOrder, QualityInspection inspection) {
        if (workOrder != null) return workOrder.getItem();
        return inspection != null ? inspection.getItem() : null;
    }

    private MfgProcess resolveProcess(WorkOrder workOrder, QualityInspection inspection) {
        if (workOrder != null && workOrder.getProcess() != null) {
            return workOrder.getProcess();
        }
        return inspection != null ? inspection.getProcess() : null;
    }
}
```

복잡한 조건이 들어가면 인터페이스지만 `default` + `private` 메서드 조합으로 충분히 처리된다.
이 경우엔 MapStruct의 코드 생성보다는 직접 빌더를 쓰는 셈인데, 그래도 Mapper 인터페이스 안에 로직이 모여 있으니 관리가 편했다.

---

## Service에서 쓰는 방법

Mapper는 `@Mapper(componentModel = "spring")` 덕분에 Spring Bean이므로, 생성자 주입으로 받는다.

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ItemService {

    private final ItemRepository itemRepository;
    private final ItemMapper itemMapper;  // 그냥 주입받으면 됨

    public List<ItemResponse> findAll() {
        return itemRepository.findAll().stream()
                .map(itemMapper::toResponse)  // 메서드 레퍼런스로 깔끔하게
                .toList();
    }

    public ItemResponse findById(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ITEM_NOT_FOUND));
        return itemMapper.toResponse(item);
    }
}
```

Controller에는 Mapper를 주입하지 않는다. Service가 이미 DTO로 변환해서 반환하기 때문.

---

## 트러블슈팅

### 1. Lombok과 충돌 — 필드가 null로 매핑됨

**증상**: 빌드는 성공하는데, 일부 필드가 null로 응답됨.

**원인**: `lombok-mapstruct-binding`이 없거나 annotationProcessor 순서 문제.
Lombok이 getter를 생성하기 전에 MapStruct가 먼저 처리해버리면, getter가 없는 상태로 매핑 코드가 만들어진다.

**해결**: `build.gradle`에 바인딩 라이브러리 추가 + annotationProcessor 순서 정렬.

```gradle
annotationProcessor 'org.mapstruct:mapstruct-processor:1.6.3'
annotationProcessor 'org.projectlombok:lombok-mapstruct-binding:0.2.0'
annotationProcessor 'org.projectlombok:lombok'
```

### 2. `isActive` 필드 매핑 이슈

**증상**: `Equipment` 엔티티의 `isActive` 필드가 DTO에 매핑되지 않음.

**원인**: Java의 boolean 필드에 `is` 접두사가 붙으면 getter 이름이 `getIsActive()`가 아니라 `isActive()`가 된다.
그런데 Entity 필드명은 `isActive`, DTO 필드명도 `isActive`인데 MapStruct가 혼동하는 상황이었다.

**해결**: `@Mapping`으로 source와 target을 명시적으로 지정.

```java
@Mapping(source = "active", target = "isActive")
EquipmentResponse toResponse(Equipment equipment);
```

Entity의 실제 필드명은 `isActive`이지만, MapStruct는 getter(`isActive()`)를 기준으로 source를 `active`로 인식한다.
DTO의 `@JsonProperty("isActive")`도 함께 붙여줘야 JSON 응답에서도 올바르게 나온다.

```java
// EquipmentResponse.java
@JsonProperty("isActive")
private boolean isActive;
```

### 3. LAZY 로딩과 `LazyInitializationException`

**증상**: Mapper에서 연관 엔티티의 필드에 접근하려는데 `LazyInitializationException` 발생.

**원인**: 연관 엔티티를 `FetchType.LAZY`로 설정했는데, 트랜잭션 바깥에서 Mapper를 호출하는 경우.

**해결**: Mapper 호출은 항상 Service 내부(= 트랜잭션 안)에서 했다.
Repository에서 Fetch Join으로 한 번에 가져오는 것도 방법이다.

```java
// Repository에서 미리 조인해서 가져오기
@Query("SELECT b FROM Bom b " +
       "JOIN FETCH b.parentItem " +
       "JOIN FETCH b.materialItem mi " +
       "JOIN FETCH mi.itemType " +
       "WHERE b.bomVersion.id = :versionId")
List<Bom> findByBomVersionIdWithDetails(@Param("versionId") Long versionId);
```

---

## 정리하면

| 상황 | 방법 |
|---|---|
| 필드명 완전 일치 | 메서드 선언만 |
| 필드명 다름 / 중첩 객체 평탄화 | `@Mapping(source, target)` |
| 복잡한 조건 분기 | `default` 메서드 |
| Lombok 같이 쓸 때 | `lombok-mapstruct-binding` 추가 필수 |
| boolean `is` 필드 | `source = "active"`, `target = "isActive"` 명시 |

수동 변환 코드를 도메인마다 짜지 않아도 되니까 코드량이 확실히 줄었다.
컴파일 타임 코드 생성이라 런타임 오버헤드도 없고, 타입 불일치는 빌드 단계에서 걸린다.
처음엔 Lombok 충돌이나 `is` 필드 매핑 같은 소소한 함정이 있었는데, 한 번 설정이 잡히고 나니 그 다음부터는 Mapper 파일 하나 추가하는 게 5분도 안 걸렸다.

단, 복잡한 비즈니스 로직이 섞인 변환은 `default` 메서드로 직접 짜야 하는 경우도 있다.
MapStruct가 만능은 아니지만, 반복적인 매핑 보일러플레이트를 없애준다는 것만으로도 충분히 도입할 만했다.
