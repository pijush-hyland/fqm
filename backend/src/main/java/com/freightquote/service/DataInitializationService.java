package com.freightquote.service;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.freightquote.entity.ContainerType;
import com.freightquote.entity.Location;
import com.freightquote.repository.ContainerTypeRepository;
import com.freightquote.repository.LocationRepository;

@Component
public class DataInitializationService implements CommandLineRunner {
    
    @Autowired
    private LocationRepository locationRepository;
    
    @Autowired
    private ContainerTypeRepository containerTypeRepository;
    
    @Override
    public void run(String... args) throws Exception {
        initializeLocations();
        initializeContainerTypes();
    }
    
    private void initializeLocations() {
        // Check if locations already exist
        if (locationRepository.count() > 0) {
            return; // Data already initialized
        }
        
        List<Location> locations = Arrays.asList(
            // Major Sea Ports
            createLocation("SHP_USNY", "Port of New York", "United States", "USA", "USNYC", Location.Type.SEA_PORT),
            createLocation("SHP_USLB", "Port of Long Beach", "United States", "USA", "USLBG", Location.Type.SEA_PORT),
            createLocation("SHP_CNSHG", "Port of Shanghai", "China", "CHN", "CNSHA", Location.Type.SEA_PORT),
            createLocation("SHP_CNSZN", "Port of Shenzhen", "China", "CHN", "CNSZX", Location.Type.SEA_PORT),
            createLocation("SHP_SGSIN", "Port of Singapore", "Singapore", "SGP", "SGSIN", Location.Type.SEA_PORT),
            createLocation("SHP_NLRTM", "Port of Rotterdam", "Netherlands", "NLD", "NLRTM", Location.Type.SEA_PORT),
            createLocation("SHP_DEHAM", "Port of Hamburg", "Germany", "DEU", "DEHAM", Location.Type.SEA_PORT),
            createLocation("SHP_AEJEA", "Port of Jebel Ali", "UAE", "ARE", "AEJEA", Location.Type.SEA_PORT),
            createLocation("SHP_JPYOK", "Port of Yokohama", "Japan", "JPN", "JPYOK", Location.Type.SEA_PORT),
            
            // Indian Sea Ports
            createLocation("SHP_INMUN", "JNPT Mumbai (Nhava Sheva)", "India", "IND", "INNSA", Location.Type.SEA_PORT),
            createLocation("SHP_INMAA", "Chennai Port", "India", "IND", "INMAA", Location.Type.SEA_PORT),
            createLocation("SHP_INCCU", "Kolkata Port", "India", "IND", "INCCU", Location.Type.SEA_PORT),
            createLocation("SHP_INKOC", "Kochi Port", "India", "IND", "INKOC", Location.Type.SEA_PORT),
            createLocation("SHP_INVTZ", "Visakhapatnam Port", "India", "IND", "INVTZ", Location.Type.SEA_PORT),
            createLocation("SHP_INMRM", "Mumbai Port Trust", "India", "IND", "INMRM", Location.Type.SEA_PORT),
            createLocation("SHP_INKAN", "Kandla Port", "India", "IND", "INKAN", Location.Type.SEA_PORT),
            createLocation("SHP_INPAV", "Paradip Port", "India", "IND", "INPAV", Location.Type.SEA_PORT),
            createLocation("SHP_INHAL", "Haldia Port", "India", "IND", "INHAL", Location.Type.SEA_PORT),
            createLocation("SHP_INENY", "Ennore Port", "India", "IND", "INENY", Location.Type.SEA_PORT),
            createLocation("SHP_INTUT", "Tuticorin Port", "India", "IND", "INTUT", Location.Type.SEA_PORT),
            createLocation("SHP_INMNG", "Mangalore Port", "India", "IND", "INMNG", Location.Type.SEA_PORT),
            createLocation("SHP_INJAW", "JNPT - Jawaharlal Nehru Port", "India", "IND", "INJAW", Location.Type.SEA_PORT),
            createLocation("SHP_INGOA", "Mormugao Port (Goa)", "India", "IND", "INGOA", Location.Type.SEA_PORT),
            createLocation("SHP_INPBD", "Port Blair", "India", "IND", "INPBD", Location.Type.SEA_PORT),
            createLocation("SHP_INKAL", "Kamarajar Port (Ennore)", "India", "IND", "INKAL", Location.Type.SEA_PORT),
            
            // Major International Airports
            createLocation("AIR_USLAX", "Los Angeles International Airport", "United States", "USA", "LAX", Location.Type.AIRPORT),
            createLocation("AIR_USJFK", "John F. Kennedy International Airport", "United States", "USA", "JFK", Location.Type.AIRPORT),
            createLocation("AIR_GBLON", "Heathrow Airport", "United Kingdom", "GBR", "LHR", Location.Type.AIRPORT),
            createLocation("AIR_DEFRM", "Frankfurt Airport", "Germany", "DEU", "FRA", Location.Type.AIRPORT),
            createLocation("AIR_NLAMM", "Amsterdam Airport Schiphol", "Netherlands", "NLD", "AMS", Location.Type.AIRPORT),
            createLocation("AIR_AEDXB", "Dubai International Airport", "UAE", "ARE", "DXB", Location.Type.AIRPORT),
            createLocation("AIR_CNPEK", "Beijing Capital International Airport", "China", "CHN", "PEK", Location.Type.AIRPORT),
            createLocation("AIR_CNPVG", "Shanghai Pudong International Airport", "China", "CHN", "PVG", Location.Type.AIRPORT),
            createLocation("AIR_SGSIN", "Singapore Changi Airport", "Singapore", "SGP", "SIN", Location.Type.AIRPORT),
            createLocation("AIR_JPNRT", "Narita International Airport", "Japan", "JPN", "NRT", Location.Type.AIRPORT),
            
            // Indian Airports - Major International
            createLocation("AIR_INDEL", "Indira Gandhi International Airport (Delhi)", "India", "IND", "DEL", Location.Type.AIRPORT),
            createLocation("AIR_INMUM", "Chhatrapati Shivaji Maharaj International Airport (Mumbai)", "India", "IND", "BOM", Location.Type.AIRPORT),
            createLocation("AIR_INBLR", "Kempegowda International Airport (Bangalore)", "India", "IND", "BLR", Location.Type.AIRPORT),
            createLocation("AIR_INMAA", "Chennai International Airport", "India", "IND", "MAA", Location.Type.AIRPORT),
            createLocation("AIR_INCCU", "Netaji Subhash Chandra Bose International Airport (Kolkata)", "India", "IND", "CCU", Location.Type.AIRPORT),
            createLocation("AIR_INHYD", "Rajiv Gandhi International Airport (Hyderabad)", "India", "IND", "HYD", Location.Type.AIRPORT),
            createLocation("AIR_INKOC", "Cochin International Airport (Kochi)", "India", "IND", "COK", Location.Type.AIRPORT),
            createLocation("AIR_INAHD", "Sardar Vallabhbhai Patel International Airport (Ahmedabad)", "India", "IND", "AMD", Location.Type.AIRPORT),
            createLocation("AIR_INGOI", "Dabolim Airport (Goa)", "India", "IND", "GOI", Location.Type.AIRPORT),
            createLocation("AIR_INPNE", "Pune Airport", "India", "IND", "PNQ", Location.Type.AIRPORT),
            
            // Indian Airports - Domestic & Regional
            createLocation("AIR_INJPR", "Jaipur International Airport", "India", "IND", "JPR", Location.Type.AIRPORT),
            createLocation("AIR_INLKO", "Chaudhary Charan Singh International Airport (Lucknow)", "India", "IND", "LKO", Location.Type.AIRPORT),
            createLocation("AIR_INJAI", "Jaipur Airport", "India", "IND", "JAI", Location.Type.AIRPORT),
            createLocation("AIR_INBHO", "Raja Bhoj Airport (Bhopal)", "India", "IND", "BHO", Location.Type.AIRPORT),
            createLocation("AIR_ININD", "Devi Ahilya Bai Holkar Airport (Indore)", "India", "IND", "IDR", Location.Type.AIRPORT),
            createLocation("AIR_INNAG", "Dr. Babasaheb Ambedkar International Airport (Nagpur)", "India", "IND", "NAG", Location.Type.AIRPORT),
            createLocation("AIR_INRPR", "Swami Vivekananda Airport (Raipur)", "India", "IND", "RPR", Location.Type.AIRPORT),
            createLocation("AIR_INBBR", "Bhubaneswar Airport", "India", "IND", "BBI", Location.Type.AIRPORT),
            createLocation("AIR_INVTZ", "Visakhapatnam Airport", "India", "IND", "VTZ", Location.Type.AIRPORT),
            createLocation("AIR_INVGA", "Vijayawada Airport", "India", "IND", "VGA", Location.Type.AIRPORT),
            createLocation("AIR_INRAJ", "Rajkot Airport", "India", "IND", "RAJ", Location.Type.AIRPORT),
            createLocation("AIR_INSUR", "Surat Airport", "India", "IND", "STV", Location.Type.AIRPORT),
            createLocation("AIR_INVNS", "Varanasi Airport", "India", "IND", "VNS", Location.Type.AIRPORT),
            createLocation("AIR_INPAT", "Jay Prakash Narayan Airport (Patna)", "India", "IND", "PAT", Location.Type.AIRPORT),
            createLocation("AIR_INRAN", "Birsa Munda Airport (Ranchi)", "India", "IND", "IXR", Location.Type.AIRPORT),
            createLocation("AIR_INBAG", "Bagdogra Airport (Siliguri)", "India", "IND", "IXB", Location.Type.AIRPORT),
            createLocation("AIR_INGAU", "Lokpriya Gopinath Bordoloi International Airport (Guwahati)", "India", "IND", "GAU", Location.Type.AIRPORT),
            createLocation("AIR_INAGR", "Agra Airport", "India", "IND", "AGR", Location.Type.AIRPORT),
            createLocation("AIR_INKNU", "Kanpur Airport", "India", "IND", "KNU", Location.Type.AIRPORT),
            createLocation("AIR_INDEH", "Jolly Grant Airport (Dehradun)", "India", "IND", "DED", Location.Type.AIRPORT),
            createLocation("AIR_INJAM", "Jammu Airport", "India", "IND", "IXJ", Location.Type.AIRPORT),
            createLocation("AIR_INIXL", "Leh Kushok Bakula Rimpochee Airport", "India", "IND", "IXL", Location.Type.AIRPORT),
            createLocation("AIR_INSRI", "Sheikh ul-Alam International Airport (Srinagar)", "India", "IND", "SXR", Location.Type.AIRPORT),
            createLocation("AIR_INCHA", "Chandigarh Airport", "India", "IND", "IXC", Location.Type.AIRPORT),
            createLocation("AIR_INADM", "Adampur Airport", "India", "IND", "AIP", Location.Type.AIRPORT),
            createLocation("AIR_INAMR", "Amritsar Airport", "India", "IND", "ATQ", Location.Type.AIRPORT),
            createLocation("AIR_INLUH", "Ludhiana Airport", "India", "IND", "LUH", Location.Type.AIRPORT),
            createLocation("AIR_INTRD", "Tirupati Airport", "India", "IND", "TIR", Location.Type.AIRPORT),
            createLocation("AIR_INCJB", "Coimbatore International Airport", "India", "IND", "CJB", Location.Type.AIRPORT),
            createLocation("AIR_INMDU", "Madurai Airport", "India", "IND", "IXM", Location.Type.AIRPORT),
            createLocation("AIR_INTCR", "Tiruchirapalli International Airport", "India", "IND", "TRZ", Location.Type.AIRPORT),
            createLocation("AIR_INTUT", "Tuticorin Airport", "India", "IND", "TCR", Location.Type.AIRPORT),
            createLocation("AIR_INMNG", "Mangalore International Airport", "India", "IND", "IXE", Location.Type.AIRPORT),
            createLocation("AIR_INJOG", "Jolly Grant Airport (Jolly Grant)", "India", "IND", "JOG", Location.Type.AIRPORT),
            createLocation("AIR_INHUB", "Hubli Airport", "India", "IND", "HBX", Location.Type.AIRPORT),
            createLocation("AIR_INBLR2", "HAL Bangalore International Airport", "India", "IND", "BLR", Location.Type.AIRPORT),
            createLocation("AIR_INMYS", "Mysore Airport", "India", "IND", "MYQ", Location.Type.AIRPORT),
            createLocation("AIR_INRAJ2", "Rajahmundry Airport", "India", "IND", "RJA", Location.Type.AIRPORT),
            createLocation("AIR_INTIR", "Tirupati Regional Airport", "India", "IND", "TIR", Location.Type.AIRPORT),
            createLocation("AIR_INKDP", "Kadapa Airport", "India", "IND", "CDP", Location.Type.AIRPORT),
            createLocation("AIR_INWGL", "Warangal Airport", "India", "IND", "WGC", Location.Type.AIRPORT),
            
            // Indian Airports - Northeast
            createLocation("AIR_INAGX", "Agartala Airport", "India", "IND", "IXA", Location.Type.AIRPORT),
            createLocation("AIR_INIXS", "Silchar Airport", "India", "IND", "IXS", Location.Type.AIRPORT),
            createLocation("AIR_INIXH", "Kailashahar Airport", "India", "IND", "IXH", Location.Type.AIRPORT),
            createLocation("AIR_INZHL", "Ziro Airport", "India", "IND", "ZER", Location.Type.AIRPORT),
            createLocation("AIR_INITN", "Itanagar Airport", "India", "IND", "HGI", Location.Type.AIRPORT),
            createLocation("AIR_INIXM", "Dimapur Airport", "India", "IND", "DMU", Location.Type.AIRPORT),
            createLocation("AIR_INIXK", "Keshod Airport", "India", "IND", "IXK", Location.Type.AIRPORT),
            createLocation("AIR_INBHJ", "Bhuj Airport", "India", "IND", "BHJ", Location.Type.AIRPORT),
            createLocation("AIR_INPOR", "Porbandar Airport", "India", "IND", "PBD", Location.Type.AIRPORT),
            createLocation("AIR_INJGA", "Jamnagar Airport", "India", "IND", "JGA", Location.Type.AIRPORT),
            
            // Indian Airports - Islands
            createLocation("AIR_INPBD", "Veer Savarkar International Airport (Port Blair)", "India", "IND", "IXZ", Location.Type.AIRPORT),
            createLocation("AIR_INCAI", "Car Nicobar Air Force Station", "India", "IND", "CBD", Location.Type.AIRPORT),
            createLocation("AIR_INLAK", "Lakshadweep Airport (Agatti)", "India", "IND", "AGX", Location.Type.AIRPORT)


        );
        
        locationRepository.saveAll(locations);
        System.out.println("Initialized " + locations.size() + " locations");
    }
    
    private void initializeContainerTypes() {
        // Check if container types already exist
        if (containerTypeRepository.count() > 0) {
            return; // Data already initialized
        }
        
        List<ContainerType> containerTypes = Arrays.asList(
            // Standard 20ft containers
            createContainerType("20GP", "20ft General Purpose", 
                "Standard 20-foot dry container for general cargo",
                new BigDecimal("5.90"), new BigDecimal("2.35"), new BigDecimal("2.39"),
                new BigDecimal("30480"), new BigDecimal("2230"), false),
                
            createContainerType("20HC", "20ft High Cube", 
                "20-foot high cube container with extra height",
                new BigDecimal("5.90"), new BigDecimal("2.35"), new BigDecimal("2.69"),
                new BigDecimal("30480"), new BigDecimal("2230"), false),
                
            // Standard 40ft containers
            createContainerType("40GP", "40ft General Purpose", 
                "Standard 40-foot dry container for general cargo",
                new BigDecimal("12.03"), new BigDecimal("2.35"), new BigDecimal("2.39"),
                new BigDecimal("30480"), new BigDecimal("3740"), false),
                
            createContainerType("40HC", "40ft High Cube", 
                "40-foot high cube container with extra height",
                new BigDecimal("12.03"), new BigDecimal("2.35"), new BigDecimal("2.69"),
                new BigDecimal("30480"), new BigDecimal("3740"), false),
                
            // Refrigerated containers
            createContainerType("20RF", "20ft Refrigerated", 
                "20-foot refrigerated container for temperature-controlled cargo",
                new BigDecimal("5.44"), new BigDecimal("2.29"), new BigDecimal("2.27"),
                new BigDecimal("30480"), new BigDecimal("3080"), true),
                
            createContainerType("40RF", "40ft Refrigerated", 
                "40-foot refrigerated container for temperature-controlled cargo",
                new BigDecimal("11.56"), new BigDecimal("2.29"), new BigDecimal("2.27"),
                new BigDecimal("30480"), new BigDecimal("4800"), true),
                
            createContainerType("40RH", "40ft Refrigerated High Cube", 
                "40-foot refrigerated high cube container",
                new BigDecimal("11.56"), new BigDecimal("2.29"), new BigDecimal("2.57"),
                new BigDecimal("30480"), new BigDecimal("4800"), true),
                
            // Open Top containers
            createContainerType("20OT", "20ft Open Top", 
                "20-foot open top container for oversized cargo",
                new BigDecimal("5.90"), new BigDecimal("2.35"), new BigDecimal("2.39"),
                new BigDecimal("30480"), new BigDecimal("2300"), false),
                
            createContainerType("40OT", "40ft Open Top", 
                "40-foot open top container for oversized cargo",
                new BigDecimal("12.03"), new BigDecimal("2.35"), new BigDecimal("2.39"),
                new BigDecimal("30480"), new BigDecimal("3900"), false),
                
            // Flat Rack containers
            createContainerType("20FR", "20ft Flat Rack", 
                "20-foot flat rack container for heavy or oversized cargo",
                new BigDecimal("5.90"), new BigDecimal("2.35"), new BigDecimal("2.39"),
                new BigDecimal("45000"), new BigDecimal("2360"), false),
                
            createContainerType("40FR", "40ft Flat Rack", 
                "40-foot flat rack container for heavy or oversized cargo",
                new BigDecimal("12.03"), new BigDecimal("2.35"), new BigDecimal("2.39"),
                new BigDecimal("45000"), new BigDecimal("5000"), false)
        );
        
        containerTypeRepository.saveAll(containerTypes);
        System.out.println("Initialized " + containerTypes.size() + " container types");
    }
    
    private Location createLocation(String Code, String name, String country, String countryCode, 
                                  String portCode, Location.Type locationType) {
        Location location = new Location();
        location.setCode(Code);
        location.setName(name);
        location.setCountry(country);
        location.setCountryCode(countryCode);
        location.setType(locationType);
        location.setIsActive(true);
        return location;
    }
    
    private ContainerType createContainerType(String code, String name, String description,
                                            BigDecimal length, BigDecimal width, BigDecimal height,
                                            BigDecimal maxGrossWeight, BigDecimal tareWeight, boolean isRefrigerated) {
        ContainerType containerType = new ContainerType();
        containerType.setCode(code);
        containerType.setName(name);
        containerType.setDescription(description);
        containerType.setLengthMeters(length);
        containerType.setWidthMeters(width);
        containerType.setHeightMeters(height);
        containerType.setMaxGrossWeightKG(maxGrossWeight);
        containerType.setTareWeightKG(tareWeight);
        containerType.setIsRefrigerated(isRefrigerated);
        containerType.setIsActive(true);
        
        // Calculate derived values
        BigDecimal volumeCBM = length.multiply(width).multiply(height);
        containerType.setVolumeCBM(volumeCBM);
        
        BigDecimal maxPayload = maxGrossWeight.subtract(tareWeight);
        containerType.setMaxPayloadKG(maxPayload);
        
        return containerType;
    }
}
