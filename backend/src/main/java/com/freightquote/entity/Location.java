package com.freightquote.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "locations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Location {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Location name is required")
    @Column(nullable = false)
    private String name;
    
    @NotBlank(message = "Location code is required")
    @Column(name = "code", nullable = false, unique = true, length = 10)
    private String code; // Unique identifier for the location
    
    @NotBlank(message = "Country is required")
    @Column(nullable = false)
    private String country;
    
    @Column(name = "country_code", length = 3)
    private String countryCode; // ISO 3166-1 alpha-3
    
    @Column(name = "type")
    @Enumerated(EnumType.STRING)
    private Type type;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    public enum Type {
        SEA_PORT, AIRPORT, CITY, INLAND_PORT
    }
}
