package com.mymes.backend.equipment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class EquipmentCreateRequest {

    @NotBlank(message = "설비명은 필수입니다.")
    @Size(max = 100)
    private String equipmentName;

    private Long equipmentTypeId;

    @Size(max = 200)
    private String location;

    @Size(max = 100)
    private String manufacturer;

    @Size(max = 100)
    private String modelName;

    private LocalDate purchaseDate;

    @Size(max = 500)
    private String description;

    @JsonProperty("isActive")
    private boolean isActive = true;
}
