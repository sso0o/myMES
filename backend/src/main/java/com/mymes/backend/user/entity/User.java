package com.mymes.backend.user.entity;

import com.mymes.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;

@Entity
@Table(name = "users")
@SQLRestriction("deleted_at IS NULL")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Supabase Auth UUID — JWT sub 클레임과 동일 */
    @Column(name = "supabase_id", nullable = false, unique = true, length = 36)
    private String supabaseId;

    /** 사번 — 로그인 ID. 자동채번(mes001, mes002, ...) 또는 "admin" */
    @Column(name = "emp_no", nullable = false, unique = true, length = 20)
    private String empNo;

    @Column(nullable = false, length = 50)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role;

    /** 재직유무: true = 재직 중, false = 퇴직 */
    @Column(nullable = false)
    private boolean active = true;

    /** 실제 퇴사일 (퇴직 처리 시 입력) */
    @Column(name = "resigned_at")
    private LocalDate resignedAt;

    @Builder
    public User(String supabaseId, String empNo, String name, UserRole role) {
        this.supabaseId = supabaseId;
        this.empNo = empNo;
        this.name = name;
        this.role = role;
        this.active = true;
    }

    public void update(String name, UserRole role) {
        this.name = name;
        this.role = role;
    }

    /** 퇴사일 예약 — Supabase 계정은 유지, 로그인 가능 */
    public void scheduleResign(LocalDate resignedAt) {
        this.resignedAt = resignedAt;
    }

    /** 실제 퇴직 처리 — 스케줄러가 퇴사일 당일 호출 */
    public void processResignation() {
        this.active = false;
        this.delete();
    }
}
