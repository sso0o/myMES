package com.mymes.backend.worker;

import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import com.mymes.backend.worker.dto.request.WorkerCreateRequest;
import com.mymes.backend.worker.dto.request.WorkerResignRequest;
import com.mymes.backend.worker.dto.request.WorkerUpdateRequest;
import com.mymes.backend.worker.dto.response.WorkerResponse;
import com.mymes.backend.worker.entity.Worker;
import com.mymes.backend.worker.entity.WorkerStatus;
import com.mymes.backend.worker.mapper.WorkerMapper;
import com.mymes.backend.worker.repository.WorkerRepository;
import com.mymes.backend.worker.service.WorkerService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class WorkerServiceTest {

    @InjectMocks
    private WorkerService workerService;

    @Mock
    private WorkerRepository workerRepository;

    @Mock
    private WorkerMapper workerMapper;

    @Test
    @DisplayName("전체 작업자 목록 조회 시 작업자코드 오름차순 응답 목록을 반환한다")
    void findAll_returnsResponseList() {
        // given
        Worker worker = Worker.builder()
                .workerCode("W0001")
                .workerName("홍길동")
                .status(WorkerStatus.ACTIVE)
                .build();
        WorkerResponse response = WorkerResponse.builder()
                .id(1L)
                .workerCode("W0001")
                .workerName("홍길동")
                .status(WorkerStatus.ACTIVE)
                .build();

        given(workerRepository.findAllByOrderByWorkerCodeAsc()).willReturn(List.of(worker));
        given(workerMapper.toResponse(worker)).willReturn(response);

        // when
        List<WorkerResponse> result = workerService.findAll();

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getWorkerCode()).isEqualTo("W0001");
    }

    @Test
    @DisplayName("존재하지 않는 작업자 단건 조회 시 WORKER_NOT_FOUND 예외가 발생한다")
    void findById_notFound_throwsException() {
        // given
        given(workerRepository.findById(99L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> workerService.findById(99L))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.WORKER_NOT_FOUND);
    }

    @Test
    @DisplayName("작업자 생성 시 기존 코드가 없으면 W0001로 자동 채번한다")
    void create_withoutLatestCode_generatesFirstCode() {
        // given
        WorkerCreateRequest request = WorkerCreateRequest.builder()
                .workerName("홍길동")
                .hireDate(LocalDate.of(2026, 5, 1))
                .build();
        Worker saved = Worker.builder()
                .workerCode("W0001")
                .workerName("홍길동")
                .status(WorkerStatus.ACTIVE)
                .hireDate(LocalDate.of(2026, 5, 1))
                .build();
        WorkerResponse response = WorkerResponse.builder()
                .workerCode("W0001")
                .workerName("홍길동")
                .status(WorkerStatus.ACTIVE)
                .build();

        given(workerRepository.findLatestWorkerCode("W")).willReturn(Optional.empty());
        given(workerRepository.saveAndFlush(any(Worker.class))).willReturn(saved);
        given(workerMapper.toResponse(saved)).willReturn(response);

        // when
        WorkerResponse result = workerService.create(request);

        // then
        assertThat(result.getWorkerCode()).isEqualTo("W0001");
        ArgumentCaptor<Worker> workerCaptor = ArgumentCaptor.forClass(Worker.class);
        verify(workerRepository).saveAndFlush(workerCaptor.capture());
        assertThat(workerCaptor.getValue().getWorkerCode()).isEqualTo("W0001");
    }

    @Test
    @DisplayName("작업자 생성 시 삭제 포함 최신 코드 다음 번호로 자동 채번한다")
    void create_withLatestCode_generatesNextCode() {
        // given
        WorkerCreateRequest request = WorkerCreateRequest.builder()
                .workerName("김철수")
                .build();
        Worker saved = Worker.builder()
                .workerCode("W0008")
                .workerName("김철수")
                .status(WorkerStatus.ACTIVE)
                .build();
        WorkerResponse response = WorkerResponse.builder()
                .workerCode("W0008")
                .workerName("김철수")
                .status(WorkerStatus.ACTIVE)
                .build();

        given(workerRepository.findLatestWorkerCode("W")).willReturn(Optional.of("W0007"));
        given(workerRepository.saveAndFlush(any(Worker.class))).willReturn(saved);
        given(workerMapper.toResponse(saved)).willReturn(response);

        // when
        WorkerResponse result = workerService.create(request);

        // then
        assertThat(result.getWorkerCode()).isEqualTo("W0008");
    }

    @Test
    @DisplayName("퇴사 상태로 수정할 때 퇴사일이 없으면 WORKER_RESIGNED_AT_REQUIRED 예외가 발생한다")
    void update_resignedWithoutDate_throwsException() {
        // given
        WorkerUpdateRequest request = WorkerUpdateRequest.builder()
                .workerName("홍길동")
                .status(WorkerStatus.RESIGNED)
                .build();

        // when & then
        assertThatThrownBy(() -> workerService.update(1L, request))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.WORKER_RESIGNED_AT_REQUIRED);
    }

    @Test
    @DisplayName("작업자 수정 시 도메인 메서드로 값을 변경하고 응답 DTO를 반환한다")
    void update_success_returnsResponse() {
        // given
        Worker worker = Worker.builder()
                .workerCode("W0001")
                .workerName("홍길동")
                .status(WorkerStatus.ACTIVE)
                .build();
        WorkerUpdateRequest request = WorkerUpdateRequest.builder()
                .workerName("홍길순")
                .phone("010-1234-5678")
                .department("생산1팀")
                .jobTitle("조립")
                .status(WorkerStatus.ON_LEAVE)
                .hireDate(LocalDate.of(2026, 5, 1))
                .description("휴직 예정")
                .build();
        WorkerResponse response = WorkerResponse.builder()
                .workerCode("W0001")
                .workerName("홍길순")
                .status(WorkerStatus.ON_LEAVE)
                .build();

        given(workerRepository.findById(1L)).willReturn(Optional.of(worker));
        given(workerMapper.toResponse(worker)).willReturn(response);

        // when
        WorkerResponse result = workerService.update(1L, request);

        // then
        assertThat(result.getWorkerName()).isEqualTo("홍길순");
        assertThat(worker.getWorkerName()).isEqualTo("홍길순");
        assertThat(worker.getStatus()).isEqualTo(WorkerStatus.ON_LEAVE);
    }

    @Test
    @DisplayName("작업자 퇴사 처리 시 상태와 퇴사일을 변경한다")
    void resign_success_updatesStatusAndDate() {
        // given
        LocalDate resignedAt = LocalDate.of(2026, 5, 31);
        Worker worker = Worker.builder()
                .workerCode("W0001")
                .workerName("홍길동")
                .status(WorkerStatus.ACTIVE)
                .build();
        WorkerResponse response = WorkerResponse.builder()
                .workerCode("W0001")
                .workerName("홍길동")
                .status(WorkerStatus.RESIGNED)
                .resignedAt(resignedAt)
                .build();

        given(workerRepository.findById(1L)).willReturn(Optional.of(worker));
        given(workerMapper.toResponse(worker)).willReturn(response);

        // when
        WorkerResponse result = workerService.resign(1L, WorkerResignRequest.builder()
                .resignedAt(resignedAt)
                .build());

        // then
        assertThat(result.getStatus()).isEqualTo(WorkerStatus.RESIGNED);
        assertThat(worker.getStatus()).isEqualTo(WorkerStatus.RESIGNED);
        assertThat(worker.getResignedAt()).isEqualTo(resignedAt);
    }

    @Test
    @DisplayName("작업자 삭제 시 entity.delete()를 호출하여 소프트 삭제한다")
    void delete_success_callsSoftDelete() {
        // given
        Worker worker = Worker.builder()
                .workerCode("W0001")
                .workerName("홍길동")
                .status(WorkerStatus.ACTIVE)
                .build();
        given(workerRepository.findById(1L)).willReturn(Optional.of(worker));

        // when
        workerService.delete(1L);

        // then
        assertThat(worker.getDeletedAt()).isNotNull();
    }
}
