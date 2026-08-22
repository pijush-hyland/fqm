package com.freightquote.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.freightquote.dto.AdministrationContainerOptionDto;
import com.freightquote.dto.CustomerContainerOptionDto;
import com.freightquote.service.ContainerTypeService;

@RestController
@RequestMapping("/container-types")
public class ContainerTypeController {

    private final ContainerTypeService containerTypeService;

    public ContainerTypeController(ContainerTypeService containerTypeService) {
        this.containerTypeService = containerTypeService;
    }
    
    @GetMapping("/customer")
    public ResponseEntity<List<CustomerContainerOptionDto>> getCustomerContainerOptions() {
        try {
            return ResponseEntity.ok(containerTypeService.getCustomerContainerOptions());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<AdministrationContainerOptionDto>> getAllContainerTypes(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
        try {
            List<AdministrationContainerOptionDto> containerTypes;

            if (search != null && !search.trim().isEmpty()) {
                containerTypes = containerTypeService.searchAdministrationContainerOptions(search);
            } else if (activeOnly) {
                containerTypes = containerTypeService.getActiveAdministrationContainerOptions();
            } else {
                containerTypes = containerTypeService.getAdministrationContainerOptions();
            }

            return ResponseEntity.ok(containerTypes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
