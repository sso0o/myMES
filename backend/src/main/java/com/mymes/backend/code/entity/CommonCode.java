package com.mymes.backend.code.entity;

import com.mymes.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(
    name = "common_codes",
    uniqueConstraints = @UniqueConstraint(columnNames = {"group_id", "code"})
)
@SQLRestriction("deleted_at IS NULL")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CommonCode extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", referencedColumnName = "group_id", nullable = false)
    private CodeGroup codeGroup;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(name = "code_name", nullable = false, length = 100)
    private String codeName;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "numbering_prefix", length = 20)
    private String numberingPrefix;

    @Builder
    public CommonCode(CodeGroup codeGroup, String code, String codeName, Integer sortOrder, String numberingPrefix) {
        this.codeGroup = codeGroup;
        this.code = code;
        this.codeName = codeName;
        this.sortOrder = sortOrder;
        this.isActive = true;
        this.numberingPrefix = numberingPrefix;
    }

    public void update(String codeName, Integer sortOrder, String numberingPrefix) {
        this.codeName = codeName;
        this.sortOrder = sortOrder;
        this.numberingPrefix = numberingPrefix;
    }

    public void deactivate() {
        this.isActive = false;
    }

    public void activate() {
        this.isActive = true;
    }
}
