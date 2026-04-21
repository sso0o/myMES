package com.mymes.backend;

import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import com.mymes.backend.defect.dto.DefectCreateRequest;
import com.mymes.backend.defect.service.DefectService;
import com.mymes.backend.item.dto.ItemUpdateRequest;
import com.mymes.backend.item.entity.Item;
import com.mymes.backend.item.repository.ItemRepository;
import com.mymes.backend.item.service.ItemService;
import com.mymes.backend.process.dto.ProcessUpdateRequest;
import com.mymes.backend.process.entity.MfgProcess;
import com.mymes.backend.process.repository.MfgProcessRepository;
import com.mymes.backend.process.service.MfgProcessService;
import com.mymes.backend.production.entity.ProductionRecord;
import com.mymes.backend.production.repository.ProductionRepository;
import com.mymes.backend.security.SupabaseJwtFilter;
import com.mymes.backend.workorder.entity.Priority;
import com.mymes.backend.workorder.entity.WorkOrder;
import com.mymes.backend.workorder.repository.WorkOrderRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

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
    private WorkOrderRepository workOrderRepository;

    @Autowired
    private ProductionRepository productionRepository;

    @Autowired
    private ItemService itemService;

    @Autowired
    private MfgProcessService processService;

    @Autowired
    private DefectService defectService;

    @Autowired
    private EntityManager entityManager;

    @Test
    void deletedItemsAreFilteredFromRepositoryQueries() {
        Item item = itemRepository.save(Item.builder()
                .itemCode("ITEM-001")
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
    void itemUpdateRejectsDuplicateCodes() {
        Item original = itemRepository.save(Item.builder()
                .itemCode("ITEM-001")
                .itemName("원본 품목")
                .unit("EA")
                .build());
        itemRepository.save(Item.builder()
                .itemCode("ITEM-002")
                .itemName("중복 대상")
                .unit("EA")
                .build());

        ItemUpdateRequest request = new ItemUpdateRequest();
        ReflectionTestUtils.setField(request, "itemCode", "ITEM-002");
        ReflectionTestUtils.setField(request, "itemName", "변경 품목");
        ReflectionTestUtils.setField(request, "unit", "EA");

        assertThatThrownBy(() -> itemService.update(original.getId(), request))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.ITEM_CODE_DUPLICATED));
    }

    @Test
    void processUpdateRejectsDuplicateCodes() {
        MfgProcess original = processRepository.save(MfgProcess.builder()
                .processCode("PROC-001")
                .processName("원본 공정")
                .sequence(1)
                .build());
        processRepository.save(MfgProcess.builder()
                .processCode("PROC-002")
                .processName("중복 대상 공정")
                .sequence(2)
                .build());

        ProcessUpdateRequest request = new ProcessUpdateRequest();
        ReflectionTestUtils.setField(request, "processCode", "PROC-002");
        ReflectionTestUtils.setField(request, "processName", "변경 공정");
        ReflectionTestUtils.setField(request, "sequence", 3);

        assertThatThrownBy(() -> processService.update(original.getId(), request))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.PROCESS_CODE_DUPLICATED));
    }

    @Test
    void defectCreateRejectsProductionRecordFromAnotherWorkOrder() {
        Item item = itemRepository.save(Item.builder()
                .itemCode("ITEM-100")
                .itemName("불량 테스트 품목")
                .unit("EA")
                .build());
        MfgProcess process = processRepository.save(MfgProcess.builder()
                .processCode("PROC-100")
                .processName("불량 테스트 공정")
                .sequence(1)
                .build());
        WorkOrder workOrderA = workOrderRepository.save(WorkOrder.builder()
                .workOrderNo("WO-20260421-0001")
                .item(item)
                .plannedQty(100)
                .priority(Priority.MEDIUM)
                .lineName("LINE-A")
                .workerName("Kim")
                .dueDate(LocalDate.of(2026, 4, 21))
                .build());
        WorkOrder workOrderB = workOrderRepository.save(WorkOrder.builder()
                .workOrderNo("WO-20260421-0002")
                .item(item)
                .plannedQty(100)
                .priority(Priority.MEDIUM)
                .lineName("LINE-B")
                .workerName("Lee")
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
}
