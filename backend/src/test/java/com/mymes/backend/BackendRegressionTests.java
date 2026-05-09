package com.mymes.backend;

import com.mymes.backend.code.dto.CodeGroupCreateRequest;
import com.mymes.backend.code.dto.CommonCodeCreateRequest;
import com.mymes.backend.code.entity.CodeGroup;
import com.mymes.backend.code.entity.CommonCode;
import com.mymes.backend.code.repository.CodeGroupRepository;
import com.mymes.backend.code.repository.CommonCodeRepository;
import com.mymes.backend.code.service.CodeGroupService;
import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import com.mymes.backend.defect.dto.DefectCreateRequest;
import com.mymes.backend.defect.service.DefectService;
import com.mymes.backend.item.dto.ItemCreateRequest;
import com.mymes.backend.item.dto.ItemUpdateRequest;
import com.mymes.backend.item.entity.Item;
import com.mymes.backend.item.repository.ItemRepository;
import com.mymes.backend.item.service.ItemService;
import com.mymes.backend.process.dto.ProcessCreateRequest;
import com.mymes.backend.process.dto.ProcessUpdateRequest;
import com.mymes.backend.process.entity.MfgProcess;
import com.mymes.backend.process.repository.MfgProcessRepository;
import com.mymes.backend.process.service.MfgProcessService;
import com.mymes.backend.production.entity.ProductionRecord;
import com.mymes.backend.production.repository.ProductionRepository;
import com.mymes.backend.security.SupabaseJwtFilter;
import com.mymes.backend.workorder.dto.WorkOrderCreateRequest;
import com.mymes.backend.workorder.entity.Priority;
import com.mymes.backend.workorder.entity.WorkOrder;
import com.mymes.backend.workorder.repository.WorkOrderRepository;
import com.mymes.backend.workorder.service.WorkOrderService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class BackendRegressionTests {

    @MockBean
    private SupabaseJwtFilter supabaseJwtFilter;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private MfgProcessRepository processRepository;

    @Autowired
    private CodeGroupRepository codeGroupRepository;

    @Autowired
    private CommonCodeRepository commonCodeRepository;

    @Autowired
    private WorkOrderRepository workOrderRepository;

    @Autowired
    private ProductionRepository productionRepository;

    @Autowired
    private ItemService itemService;

    @Autowired
    private MfgProcessService processService;

    @Autowired
    private CodeGroupService codeGroupService;

    @Autowired
    private DefectService defectService;

    @Autowired
    private WorkOrderService workOrderService;

    @Autowired
    private EntityManager entityManager;

    @Test
    void deletedItemsAreFilteredFromRepositoryQueries() {
        Item item = itemRepository.save(Item.builder()
                .itemCode("ITEM-000001")
                .itemName("테스트 품목")
                .unit("EA")
                .build());

        item.delete();
        itemRepository.flush();
        entityManager.clear();

        assertThat(itemRepository.findAll()).isEmpty();
        assertThat(itemRepository.findById(item.getId())).isEmpty();
    }

    @Test
    void itemCreateGeneratesNextCodeFromDatabaseState() {
        itemRepository.save(Item.builder()
                .itemCode("ITEM-000007")
                .itemName("기존 품목")
                .unit("EA")
                .build());

        ItemCreateRequest request = new ItemCreateRequest();
        ReflectionTestUtils.setField(request, "itemName", "신규 품목");
        ReflectionTestUtils.setField(request, "unit", "EA");

        String createdItemCode = itemService.create(request).getItemCode();

        assertThat(createdItemCode).isEqualTo("ITEM-000008");
    }

    @Test
    void itemUpdateKeepsExistingCode() {
        Item item = itemRepository.save(Item.builder()
                .itemCode("ITEM-000010")
                .itemName("수정 전 품목")
                .unit("EA")
                .build());

        ItemUpdateRequest request = new ItemUpdateRequest();
        ReflectionTestUtils.setField(request, "itemName", "수정 후 품목");
        ReflectionTestUtils.setField(request, "unit", "BOX");

        itemService.update(item.getId(), request);

        assertThat(item.getItemCode()).isEqualTo("ITEM-000010");
        assertThat(item.getItemName()).isEqualTo("수정 후 품목");
        assertThat(item.getUnit()).isEqualTo("BOX");
    }

    @Test
    void processCreateGeneratesNextCodeFromDatabaseState() {
        processRepository.save(MfgProcess.builder()
                .processCode("PROC-000003")
                .processName("기존 공정")
                .build());

        ProcessCreateRequest request = new ProcessCreateRequest();
        ReflectionTestUtils.setField(request, "processName", "신규 공정");

        String createdProcessCode = processService.create(request).getProcessCode();

        assertThat(createdProcessCode).isEqualTo("PROC-000004");
    }

    @Test
    void processUpdateKeepsExistingCode() {
        MfgProcess process = processRepository.save(MfgProcess.builder()
                .processCode("PROC-000011")
                .processName("수정 전 공정")
                .build());

        ProcessUpdateRequest request = new ProcessUpdateRequest();
        ReflectionTestUtils.setField(request, "processName", "수정 후 공정");
        ReflectionTestUtils.setField(request, "isActive", true);

        processService.update(process.getId(), request);

        assertThat(process.getProcessCode()).isEqualTo("PROC-000011");
        assertThat(process.getProcessName()).isEqualTo("수정 후 공정");
        assertThat(process.isActive()).isTrue();
    }

    @Test
    void commonCodeCreateGeneratesNextCodeFromDatabaseStateAfterDelete() {
        CodeGroupCreateRequest groupRequest = new CodeGroupCreateRequest();
        ReflectionTestUtils.setField(groupRequest, "groupId", "ITEM_TYPE");
        ReflectionTestUtils.setField(groupRequest, "groupName", "Item Type");
        codeGroupService.create(groupRequest);

        CodeGroup codeGroup = codeGroupRepository.findByGroupId("ITEM_TYPE").orElseThrow();
        commonCodeRepository.save(CommonCode.builder()
                .codeGroup(codeGroup)
                .code("000")
                .codeName("Raw Material")
                .sortOrder(1)
                .build());
        CommonCode deletedCode = commonCodeRepository.save(CommonCode.builder()
                .codeGroup(codeGroup)
                .code("001")
                .codeName("Semi Finished")
                .sortOrder(2)
                .build());
        commonCodeRepository.save(CommonCode.builder()
                .codeGroup(codeGroup)
                .code("002")
                .codeName("Finished Goods")
                .sortOrder(3)
                .build());

        deletedCode.delete();
        commonCodeRepository.flush();
        entityManager.clear();

        CommonCodeCreateRequest request = new CommonCodeCreateRequest();
        ReflectionTestUtils.setField(request, "codeName", "Packaging");
        ReflectionTestUtils.setField(request, "sortOrder", 4);

        String createdCode = codeGroupService.createCode("ITEM_TYPE", request).getCode();

        assertThat(createdCode).isEqualTo("003");
    }

    @Test
    void defectCreateRejectsProductionRecordFromAnotherWorkOrder() {
        Item item = itemRepository.save(Item.builder()
                .itemCode("ITEM-000100")
                .itemName("불량 테스트 품목")
                .unit("EA")
                .build());
        MfgProcess process = processRepository.save(MfgProcess.builder()
                .processCode("PROC-000100")
                .processName("불량 테스트 공정")
                .build());
        WorkOrder workOrderA = workOrderRepository.save(WorkOrder.builder()
                .workOrderNo("WO-20260421-0001")
                .item(item)
                .plannedQty(100)
                .priority(Priority.MEDIUM)
                .workerName("Kim")
                .productionDate(LocalDate.of(2026, 4, 21))
                .dueDate(LocalDate.of(2026, 4, 21))
                .build());
        WorkOrder workOrderB = workOrderRepository.save(WorkOrder.builder()
                .workOrderNo("WO-20260421-0002")
                .item(item)
                .plannedQty(100)
                .priority(Priority.MEDIUM)
                .workerName("Lee")
                .productionDate(LocalDate.of(2026, 4, 22))
                .dueDate(LocalDate.of(2026, 4, 22))
                .build());
        ProductionRecord productionRecord = productionRepository.save(ProductionRecord.builder()
                .workOrder(workOrderB)
                .process(process)
                .inputQty(100)
                .completedQty(90)
                .defectQty(10)
                .build());

        DefectCreateRequest request = new DefectCreateRequest();
        ReflectionTestUtils.setField(request, "productionRecordId", productionRecord.getId());
        ReflectionTestUtils.setField(request, "defectType", "스크래치");
        ReflectionTestUtils.setField(request, "qty", 1);
        ReflectionTestUtils.setField(request, "causeMemo", "work order mismatch");

        assertThatThrownBy(() -> defectService.create(workOrderA.getId(), request))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.DEFECT_PRODUCTION_RECORD_WORK_ORDER_MISMATCH));
    }

    @Test
    void workOrderCreateGeneratesNextNumberFromDatabaseState() {
        Item item = itemRepository.save(Item.builder()
                .itemCode("ITEM-000200")
                .itemName("작업지시 테스트 품목")
                .unit("EA")
                .build());
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        workOrderRepository.save(WorkOrder.builder()
                .workOrderNo("WO-" + today + "-0007")
                .item(item)
                .plannedQty(50)
                .priority(Priority.HIGH)
                .workerName("Kim")
                .productionDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(1))
                .build());

        WorkOrderCreateRequest request = new WorkOrderCreateRequest();
        ReflectionTestUtils.setField(request, "itemId", item.getId());
        ReflectionTestUtils.setField(request, "plannedQty", 70);
        ReflectionTestUtils.setField(request, "priority", Priority.MEDIUM);
        ReflectionTestUtils.setField(request, "workerName", "Lee");
        ReflectionTestUtils.setField(request, "productionDate", LocalDate.now());
        ReflectionTestUtils.setField(request, "dueDate", LocalDate.now().plusDays(2));

        String createdWorkOrderNo = workOrderService.create(request).getWorkOrderNo();

        assertThat(createdWorkOrderNo).isEqualTo("WO-" + today + "-0008");
    }
}
