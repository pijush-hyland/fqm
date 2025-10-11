package com.freightquote.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.freightquote.entity.ContainerType;
import com.freightquote.service.ContainerTypeService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/container-types")
@CrossOrigin(origins = {"http://localhost:3000", "https://*.devtunnels.ms"})
public class ContainerTypeController {
    
    @Autowired
    private ContainerTypeService containerTypeService;
    
    @GetMapping
    public ResponseEntity<List<ContainerType>> getAllContainerTypes(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
        
        try {
            List<ContainerType> containerTypes;
            
            if (search != null && !search.trim().isEmpty()) {
                containerTypes = containerTypeService.searchContainerTypes(search);
            } else if (activeOnly) {
                containerTypes = containerTypeService.getActiveContainerTypesOrderedByCbm();
            } else {
                containerTypes = containerTypeService.getAllContainerTypes();
            }
            
            return ResponseEntity.ok(containerTypes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ContainerType> getContainerTypeById(@PathVariable Long id) {
        try {
            Optional<ContainerType> containerType = containerTypeService.getContainerTypeById(id);
            return containerType.map(ResponseEntity::ok)
                              .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/code/{code}")
    public ResponseEntity<ContainerType> getContainerTypeByCode(@PathVariable String code) {
        try {
            Optional<ContainerType> containerType = containerTypeService.getContainerTypeByCode(code);
            return containerType.map(ResponseEntity::ok)
                              .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/suitable")
    public ResponseEntity<List<ContainerType>> getSuitableContainers(
            @RequestParam(required = false) Double weightKG,
            @RequestParam(required = false) Double volumeCBM) {
        
        try {
            List<ContainerType> suitableContainers = containerTypeService.findSuitableContainers(weightKG, volumeCBM);
            return ResponseEntity.ok(suitableContainers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping
    public ResponseEntity<ContainerType> createContainerType(@Valid @RequestBody ContainerType containerType) {
        try {
            ContainerType savedContainerType = containerTypeService.saveContainerType(containerType);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedContainerType);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ContainerType> updateContainerType(@PathVariable Long id, @Valid @RequestBody ContainerType containerType) {
        try {
            Optional<ContainerType> existingContainerType = containerTypeService.getContainerTypeById(id);
            if (!existingContainerType.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            containerType.setId(id);
            ContainerType updatedContainerType = containerTypeService.saveContainerType(containerType);
            return ResponseEntity.ok(updatedContainerType);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContainerType(@PathVariable Long id) {
        try {
            Optional<ContainerType> containerType = containerTypeService.getContainerTypeById(id);
            if (!containerType.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            containerTypeService.deleteContainerType(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/volume-weight")
    public ResponseEntity<Double> calculateVolumeWeight(
            @RequestParam Double volumeCBM,
            @RequestParam(defaultValue = "167") Double volumetricFactor) {
        
        try {
            Double volumeWeight = containerTypeService.calculateVolumeWeight(volumeCBM, volumetricFactor);
            return ResponseEntity.ok(volumeWeight);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/chargeable-weight")
    public ResponseEntity<Double> calculateChargeableWeight(
            @RequestParam(required = false) Double grossWeightKG,
            @RequestParam(required = false) Double volumeWeightKG) {
        
        try {
            Double chargeableWeight = containerTypeService.calculateChargeableWeight(grossWeightKG, volumeWeightKG);
            return ResponseEntity.ok(chargeableWeight);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
