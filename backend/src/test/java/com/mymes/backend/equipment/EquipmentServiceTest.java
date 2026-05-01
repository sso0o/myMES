package com.mymes.backend.equipment;

import com.mymes.backend.code.entity.CommonCode;
import com.mymes.backend.code.repository.CommonCodeRepository;
import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import com.mymes.backend.equipment.dto.EquipmentCreateRequest;
import com.mymes.backend.equipment.dto.EquipmentResponse;
import com.mymes.backend.equipment.dto.EquipmentUpdateRequest;
import com.mymes.backend.equipment.entity.Equipment;
import com.mymes.backend.equipment.mapper.EquipmentMapper;
import com.mymes.backend.equipment.repository.EquipmentRepository;
import com.mymes.backend.equipment.service.EquipmentService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class EquipmentServiceTest {

    @InjectMocks
    private EquipmentService equipmentService;

    @Mock
    private EquipmentRepository equipmentRepository;

    @Mock
    private EquipmentMapper equipmentMapper;

    @Mock
    private CommonCodeRepository commonCodeRepository;

    @Test
    @DisplayName("전체 설비 목록 조회 시 매핑된 응답 목록을 반환한다")
    void findAll_returnsResponseList() {
        // given
        Equipment equipment = Equipment.builder()
                .equipmentCode("EQ-000001")
                .equipmentName("CNC 머신")
                .isActive(true)
                .build();
        EquipmentResponse response = EquipmentResponse.builder()
                .id(1L)
                .equipmentCode("EQ-000001")
                .equipmentName("CNC 머신")
                .isActive(true)
                .build();

        given(equipmentRepository.findAllByOrderByEquipmentCodeAsc()).willReturn(List.of(equipment));
        given(equipmentMapper.toResponse(equipment)).willReturn(response);

        // when
        List<EquipmentResponse> result = equipmentService.findAll();

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEquipmentName()).isEqualTo("CNC 머신");
    }

    @Test
    @DisplayName("존재하지 않는 설비 단건 조회 시 EQUIPMENT_NOT_FOUND 예외가 발생한다")
    void findById_notFound_throwsException() {
        // given
        given(equipmentRepository.findById(99L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> equipmentService.findById(99L))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.EQUIPMENT_NOT_FOUND);
    }

    @Test
    @DisplayName("설비 생성 시 자동 채번된 코드로 저장되고 응답 DTO를 반환한다")
    void create_success_returnsResponse() {
        // given
        EquipmentCreateRequest request = new EquipmentCreateRequest();

        Equipment saved = Equipment.builder()
                .equipmentCode("EQ-000001")
                .equipmentName("CNC 머신")
                .isActive(true)
                .build();
        EquipmentResponse response = EquipmentResponse.builder()
                .equipmentCode("EQ-000001")
                .equipmentName("CNC 머신")
                .isActive(true)
                .build();

        given(equipmentRepository.findLatestEquipmentCode("EQ-")).willReturn(Optional.empty());
        given(equipmentRepository.saveAndFlush(any(Equipment.class))).willReturn(saved);
        given(equipmentMapper.toResponse(saved)).willReturn(response);

        // when
        EquipmentResponse result = equipmentService.create(request);

        // then
        assertThat(result.getEquipmentCode()).isEqualTo("EQ-000001");
        verify(equipmentRepository).saveAndFlush(any(Equipment.class));
    }

    @Test
    @DisplayName("존재하지 않는 설비 수정 시 EQUIPMENT_NOT_FOUND 예외가 발생한다")
    void update_notFound_throwsException() {
        // given
        EquipmentUpdateRequest request = new EquipmentUpdateRequest();
        given(equipmentRepository.findById(99L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> equipmentService.update(99L, request))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.EQUIPMENT_NOT_FOUND);
    }

    @Test
    @DisplayName("존재하지 않는 설비 삭제 시 EQUIPMENT_NOT_FOUND 예외가 발생한다")
    void delete_notFound_throwsException() {
        // given
        given(equipmentRepository.findById(99L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> equipmentService.delete(99L))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.EQUIPMENT_NOT_FOUND);
    }

    @Test
    @DisplayName("설비 삭제 시 entity.delete()를 호출하여 소프트 삭제한다")
    void delete_success_callsSoftDelete() {
        // given
        Equipment equipment = Equipment.builder()
                .equipmentCode("EQ-000001")
                .equipmentName("CNC 머신")
                .isActive(true)
                .build();
        given(equipmentRepository.findById(1L)).willReturn(Optional.of(equipment));

        // when
        equipmentService.delete(1L);

        // then
        assertThat(equipment.getDeletedAt()).isNotNull();
    }

    @Test
    @DisplayName("설비유형 ID가 없을 경우 공통코드 조회 없이 null로 처리한다")
    void create_withoutEquipmentType_setsTypeAsNull() {
        // given
        EquipmentCreateRequest request = new EquipmentCreateRequest();
        Equipment saved = Equipment.builder()
                .equipmentCode("EQ-000001")
                .equipmentName("기본 설비")
                .isActive(true)
                .build();
        EquipmentResponse response = EquipmentResponse.builder()
                .equipmentCode("EQ-000001")
                .isActive(true)
                .build();

        given(equipmentRepository.findLatestEquipmentCode("EQ-")).willReturn(Optional.empty());
        given(equipmentRepository.saveAndFlush(any(Equipment.class))).willReturn(saved);
        given(equipmentMapper.toResponse(saved)).willReturn(response);

        // when
        equipmentService.create(request);

        // then — commonCodeRepository 는 호출되지 않아야 함
        verify(commonCodeRepository, org.mockito.Mockito.never()).findById(any());
    }
}
