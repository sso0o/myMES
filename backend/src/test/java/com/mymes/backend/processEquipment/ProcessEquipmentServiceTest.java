package com.mymes.backend.processEquipment;

import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import com.mymes.backend.equipment.entity.Equipment;
import com.mymes.backend.equipment.service.EquipmentService;
import com.mymes.backend.process.entity.MfgProcess;
import com.mymes.backend.process.service.MfgProcessService;
import com.mymes.backend.processEquipment.dto.ProcessEquipmentCreateRequest;
import com.mymes.backend.processEquipment.dto.ProcessEquipmentResponse;
import com.mymes.backend.processEquipment.dto.ProcessEquipmentUpdateRequest;
import com.mymes.backend.processEquipment.entity.ProcessEquipment;
import com.mymes.backend.processEquipment.mapper.ProcessEquipmentMapper;
import com.mymes.backend.processEquipment.repository.ProcessEquipmentRepository;
import com.mymes.backend.processEquipment.service.ProcessEquipmentService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ProcessEquipmentServiceTest {

    @InjectMocks
    private ProcessEquipmentService processEquipmentService;

    @Mock
    private ProcessEquipmentRepository processEquipmentRepository;

    @Mock
    private ProcessEquipmentMapper processEquipmentMapper;

    @Mock
    private MfgProcessService processService;

    @Mock
    private EquipmentService equipmentService;

    @Test
    @DisplayName("공정 ID로 배정된 설비 목록을 조회한다")
    void findByProcessId_returnsList() {
        // given
        Long processId = 1L;
        ProcessEquipment pe = createProcessEquipment(1L, false);
        ProcessEquipmentResponse response = createResponse(1L, false);

        given(processEquipmentRepository.findByProcessIdOrderByIsPrimaryDescCreatedAtAsc(processId))
                .willReturn(List.of(pe));
        given(processEquipmentMapper.toResponse(pe)).willReturn(response);

        // when
        List<ProcessEquipmentResponse> result = processEquipmentService.findByProcessId(processId);

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("설비 ID로 배정된 공정 목록을 조회한다")
    void findByEquipmentId_returnsList() {
        // given
        Long equipmentId = 1L;
        ProcessEquipment pe = createProcessEquipment(1L, false);
        ProcessEquipmentResponse response = createResponse(1L, false);

        given(processEquipmentRepository.findByEquipmentIdOrderByIsPrimaryDescCreatedAtAsc(equipmentId))
                .willReturn(List.of(pe));
        given(processEquipmentMapper.toResponse(pe)).willReturn(response);

        // when
        List<ProcessEquipmentResponse> result = processEquipmentService.findByEquipmentId(equipmentId);

        // then
        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("존재하지 않는 배정 ID 조회 시 예외가 발생한다")
    void findById_notFound_throwsException() {
        // given
        given(processEquipmentRepository.findById(99L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> processEquipmentService.findById(99L))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.PROCESS_EQUIPMENT_NOT_FOUND);
    }

    @Test
    @DisplayName("공정에 설비를 정상 배정한다")
    void create_success() {
        // given
        ProcessEquipmentCreateRequest request = ProcessEquipmentCreateRequest.builder()
                .processId(1L)
                .equipmentId(1L)
                .isPrimary(true)
                .build();

        MfgProcess process = createProcess(1L);
        Equipment equipment = createEquipment(1L);
        ProcessEquipment pe = createProcessEquipment(1L, true);
        ProcessEquipmentResponse response = createResponse(1L, true);

        given(processService.getProcess(1L)).willReturn(process);
        given(equipmentService.getEquipment(1L)).willReturn(equipment);
        given(processEquipmentRepository.existsByProcessIdAndEquipmentId(1L, 1L)).willReturn(false);
        given(processEquipmentRepository.save(any(ProcessEquipment.class))).willReturn(pe);
        given(processEquipmentMapper.toResponse(pe)).willReturn(response);

        // when
        ProcessEquipmentResponse result = processEquipmentService.create(request);

        // then
        assertThat(result.isPrimary()).isTrue();
        verify(processEquipmentRepository).save(any(ProcessEquipment.class));
    }

    @Test
    @DisplayName("이미 배정된 공정-설비 조합 등록 시 예외가 발생한다")
    void create_duplicated_throwsException() {
        // given
        ProcessEquipmentCreateRequest request = ProcessEquipmentCreateRequest.builder()
                .processId(1L)
                .equipmentId(1L)
                .isPrimary(false)
                .build();

        given(processService.getProcess(1L)).willReturn(createProcess(1L));
        given(equipmentService.getEquipment(1L)).willReturn(createEquipment(1L));
        given(processEquipmentRepository.existsByProcessIdAndEquipmentId(1L, 1L)).willReturn(true);

        // when & then
        assertThatThrownBy(() -> processEquipmentService.create(request))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.PROCESS_EQUIPMENT_DUPLICATED);
    }

    @Test
    @DisplayName("주 설비 여부를 수정한다")
    void update_isPrimary_success() {
        // given
        ProcessEquipment pe = createProcessEquipment(1L, false);
        ProcessEquipmentUpdateRequest request = new ProcessEquipmentUpdateRequest(true);
        ProcessEquipmentResponse response = createResponse(1L, true);

        given(processEquipmentRepository.findById(1L)).willReturn(Optional.of(pe));
        given(processEquipmentMapper.toResponse(pe)).willReturn(response);

        // when
        ProcessEquipmentResponse result = processEquipmentService.update(1L, request);

        // then
        assertThat(result.isPrimary()).isTrue();
    }

    @Test
    @DisplayName("존재하지 않는 배정 수정 시 예외가 발생한다")
    void update_notFound_throwsException() {
        // given
        given(processEquipmentRepository.findById(99L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> processEquipmentService.update(99L, new ProcessEquipmentUpdateRequest(true)))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.PROCESS_EQUIPMENT_NOT_FOUND);
    }

    @Test
    @DisplayName("배정을 소프트 삭제한다")
    void delete_success() {
        // given
        ProcessEquipment pe = createProcessEquipment(1L, false);
        given(processEquipmentRepository.findById(1L)).willReturn(Optional.of(pe));

        // when
        processEquipmentService.delete(1L);

        // then
        assertThat(pe.isDeleted()).isTrue();
    }

    @Test
    @DisplayName("존재하지 않는 배정 삭제 시 예외가 발생한다")
    void delete_notFound_throwsException() {
        // given
        given(processEquipmentRepository.findById(99L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> processEquipmentService.delete(99L))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.PROCESS_EQUIPMENT_NOT_FOUND);
    }

    // --- 헬퍼 메서드 ---

    private MfgProcess createProcess(Long id) {
        MfgProcess process = MfgProcess.builder()
                .processCode("PROC-000001")
                .processName("테스트공정")
                .build();
        ReflectionTestUtils.setField(process, "id", id);
        return process;
    }

    private Equipment createEquipment(Long id) {
        Equipment equipment = Equipment.builder()
                .equipmentCode("EQ-000001")
                .equipmentName("테스트설비")
                .build();
        ReflectionTestUtils.setField(equipment, "id", id);
        return equipment;
    }

    private ProcessEquipment createProcessEquipment(Long id, boolean isPrimary) {
        ProcessEquipment pe = ProcessEquipment.builder()
                .process(createProcess(1L))
                .equipment(createEquipment(1L))
                .isPrimary(isPrimary)
                .build();
        ReflectionTestUtils.setField(pe, "id", id);
        return pe;
    }

    private ProcessEquipmentResponse createResponse(Long id, boolean isPrimary) {
        return ProcessEquipmentResponse.builder()
                .id(id)
                .processId(1L)
                .processCode("PROC-000001")
                .processName("테스트공정")
                .equipmentId(1L)
                .equipmentCode("EQ-000001")
                .equipmentName("테스트설비")
                .isPrimary(isPrimary)
                .build();
    }
}
