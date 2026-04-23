package com.mymes.backend.planning.service;

import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import com.mymes.backend.item.entity.Item;
import com.mymes.backend.item.service.ItemService;
import com.mymes.backend.planning.dto.ProductionPlanCreateRequest;
import com.mymes.backend.planning.dto.ProductionPlanResponse;
import com.mymes.backend.planning.dto.ProductionPlanUpdateRequest;
import com.mymes.backend.planning.entity.PlanStatus;
import com.mymes.backend.planning.entity.ProductionPlan;
import com.mymes.backend.planning.mapper.ProductionPlanMapper;
import com.mymes.backend.planning.repository.ProductionPlanRepository;
import com.mymes.backend.user.entity.User;
import com.mymes.backend.user.service.UserService;
import com.mymes.backend.workorder.entity.WorkOrder;
import com.mymes.backend.workorder.service.WorkOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductionPlanService {

    private static final DateTimeFormatter PLAN_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final int MAX_PLAN_NO_RETRIES = 3;

    private final ProductionPlanRepository productionPlanRepository;
    private final ItemService itemService;
    private final UserService userService;
    private final WorkOrderService workOrderService;
    private final ProductionPlanMapper productionPlanMapper;

    public List<ProductionPlanResponse> findAll() {
        return productionPlanRepository.findAll().stream()
                .map(productionPlanMapper::toResponse)
                .toList();
    }

    public List<ProductionPlanResponse> findByStatus(PlanStatus status) {
        return productionPlanRepository.findByStatusOrderByPlannedDateAsc(status).stream()
                .map(productionPlanMapper::toResponse)
                .toList();
    }

    public ProductionPlanResponse findById(Long id) {
        return productionPlanMapper.toResponse(getPlan(id));
    }

    @Transactional
    public ProductionPlanResponse create(ProductionPlanCreateRequest request, String supabaseId) {
        Item item = itemService.getItem(request.getItemId());
        User createdBy = userService.getUserBySupabaseId(supabaseId);

        for (int attempt = 1; attempt <= MAX_PLAN_NO_RETRIES; attempt++) {
            String planNo = generatePlanNo();
            ProductionPlan plan = ProductionPlan.builder()
                    .planNo(planNo)
                    .item(item)
                    .plannedQty(request.getPlannedQty())
                    .plannedDate(request.getPlannedDate())
                    .createdBy(createdBy)
                    .memo(request.getMemo())
                    .build();
            try {
                ProductionPlan saved = productionPlanRepository.saveAndFlush(plan);
                log.info("생산계획 생성 완료: id={}, no={}", saved.getId(), saved.getPlanNo());
                return productionPlanMapper.toResponse(saved);
            } catch (DataIntegrityViolationException e) {
                log.warn("생산계획 번호 충돌로 재시도합니다. attempt={}", attempt);
                if (attempt == MAX_PLAN_NO_RETRIES) {
                    throw new BusinessException(ErrorCode.PLAN_NO_GENERATION_FAILED);
                }
            }
        }
        throw new BusinessException(ErrorCode.PLAN_NO_GENERATION_FAILED);
    }

    @Transactional
    public ProductionPlanResponse update(Long id, ProductionPlanUpdateRequest request) {
        ProductionPlan plan = getPlan(id);
        Item item = itemService.getItem(request.getItemId());
        plan.update(item, request.getPlannedQty(), request.getPlannedDate(), request.getMemo());
        log.info("생산계획 수정 완료: id={}", id);
        return productionPlanMapper.toResponse(plan);
    }

    @Transactional
    public ProductionPlanResponse changeStatus(Long id, PlanStatus newStatus) {
        ProductionPlan plan = getPlan(id);

        if (newStatus == PlanStatus.RELEASED) {
            if (plan.getWorkOrder() != null) {
                throw new BusinessException(ErrorCode.PLAN_ALREADY_RELEASED);
            }
            WorkOrder workOrder = workOrderService.createForPlan(
                    plan.getItem(), plan.getPlannedQty(), plan.getPlannedDate());
            plan.linkWorkOrder(workOrder);
        }

        plan.changeStatus(newStatus);
        log.info("생산계획 상태 변경 완료: id={}, status={}", id, newStatus);
        return productionPlanMapper.toResponse(plan);
    }

    @Transactional
    public void delete(Long id) {
        ProductionPlan plan = getPlan(id);
        if (plan.getStatus() != PlanStatus.DRAFT) {
            throw new BusinessException(ErrorCode.PLAN_NOT_DELETABLE);
        }
        plan.delete();
        log.info("생산계획 삭제 완료: id={}", id);
    }

    public ProductionPlan getPlan(Long id) {
        return productionPlanRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PLAN_NOT_FOUND, String.valueOf(id)));
    }

    private String generatePlanNo() {
        String date = LocalDate.now().format(PLAN_DATE_FORMAT);
        String prefix = "PP-" + date + "-";
        int nextSequence = productionPlanRepository.findLatestPlanNoByPrefix(prefix)
                .map(latestNo -> Integer.parseInt(latestNo.substring(latestNo.lastIndexOf('-') + 1)) + 1)
                .orElse(1);
        return prefix + String.format("%04d", nextSequence);
    }
}
