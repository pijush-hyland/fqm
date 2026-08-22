package com.freightquote.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.ArgumentMatchers;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.jpa.domain.Specification;

import com.freightquote.dto.ShippingRequirementDto;
import com.freightquote.entity.ContainerType;
import com.freightquote.entity.CourierRate;
import com.freightquote.entity.FCLFreightRate;
import com.freightquote.enums.SeaFreightMode;
import com.freightquote.enums.ShippingType;
import com.freightquote.exception.InvalidContainerSelectionException;
import com.freightquote.repository.ContainerTypeRepository;
import com.freightquote.repository.CourierRateRepository;

class QuoteServiceTest {

    @Mock
    private CourierRateRepository courierRateRepository;

    @Mock
    private ContainerTypeRepository containerTypeRepository;

    private QuoteService quoteService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        quoteService = new QuoteService(courierRateRepository, containerTypeRepository);
    }

    @ParameterizedTest(name = "rejects {0} before matching")
    @MethodSource("invalidSelections")
    void rejectsInvalidFclSelectionsBeforeRateMatching(
            String scenario,
            Map<Long, Integer> selection,
            List<ContainerType> storedOptions,
            List<Long> offendingIds) {
        when(containerTypeRepository.findByIdIn(any())).thenReturn(storedOptions);

        assertThatThrownBy(() -> quoteService.findMatchingQuotes(fclRequirement(selection)))
                .isInstanceOf(InvalidContainerSelectionException.class)
                .extracting("containerIds")
                .isEqualTo(offendingIds);

        verify(courierRateRepository, never()).findAll(anyQuoteSpecification());
    }

    @Test
    void exposesOnlyRequestedActiveContainerRatesInCustomerQuotes() {
        ContainerType requestedOption = validOption(1L);
        ContainerType retiredOption = validOption(2L);
        retiredOption.setIsActive(false);
        when(containerTypeRepository.findByIdIn(any())).thenReturn(List.of(requestedOption));

        CourierRate courierRate = new CourierRate();
        courierRate.setShippingType(ShippingType.WATER);
        courierRate.setSeaFreightMode(SeaFreightMode.FCL);
        FCLFreightRate retiredRate = fclRate(retiredOption, "200.00");
        retiredRate.setDocumentationFee(new BigDecimal("99.00"));
        FCLFreightRate requestedRate = fclRate(requestedOption, "100.00");
        requestedRate.setDocumentationFee(new BigDecimal("10.00"));
        courierRate.setFclFreightDetails(List.of(retiredRate, requestedRate));
        when(courierRateRepository.findAll(anyQuoteSpecification()))
                .thenReturn(List.of(courierRate));

        var quotes = quoteService.findMatchingQuotes(fclRequirement(Map.of(1L, 1)));

        assertThat(quotes).singleElement()
                .extracting(quote -> quote.getRatesForFCL())
                .isEqualTo(Map.of(1L, new BigDecimal("100.00")));
        assertThat(quotes.get(0).getDocumentationFee()).isEqualByComparingTo("10.00");
    }

    @Test
    void returnsNoQuotationWhenAnActiveTankOptionHasNoRouteRate() {
        ContainerType tankOption = validOption(12L);
        tankOption.setCode("20TK");
        tankOption.setName("20 Feet Iso Tank");
        tankOption.setInternalLengthMeters(null);
        tankOption.setInternalWidthMeters(null);
        tankOption.setInternalHeightMeters(null);
        when(containerTypeRepository.findByIdIn(any())).thenReturn(List.of(tankOption));
        when(courierRateRepository.findAll(anyQuoteSpecification()))
                .thenReturn(List.of());

        assertThat(quoteService.findMatchingQuotes(fclRequirement(Map.of(12L, 1)))).isEmpty();
        verify(courierRateRepository).findAll(anyQuoteSpecification());
    }

    private static Stream<Arguments> invalidSelections() {
        ContainerType retired = validOption(2L);
        retired.setIsActive(false);
        ContainerType invalidDetails = validOption(3L);
        invalidDetails.setCapacityCbm(BigDecimal.ZERO);
        ContainerType partialDimensions = validOption(4L);
        partialDimensions.setInternalHeightMeters(null);
        ContainerType invalidTareWeight = validOption(5L);
        invalidTareWeight.setTareWeightKg(BigDecimal.ZERO);
        ContainerType inconsistentTotalWeight = validOption(6L);
        inconsistentTotalWeight.setMaximumTotalWeightKg(new BigDecimal("28000.00"));

        return Stream.of(
                Arguments.of("unknown option", Map.of(99L, 1), List.of(), List.of(99L)),
                Arguments.of("retired option", Map.of(2L, 1), List.of(retired), List.of(2L)),
                Arguments.of("invalid option details", Map.of(3L, 1), List.of(invalidDetails), List.of(3L)),
                Arguments.of("partial dimensions", Map.of(4L, 1), List.of(partialDimensions), List.of(4L)),
                Arguments.of("invalid tare weight", Map.of(5L, 1), List.of(invalidTareWeight), List.of(5L)),
                Arguments.of("inconsistent total weight", Map.of(6L, 1), List.of(inconsistentTotalWeight), List.of(6L)),
                Arguments.of("zero quantity", Map.of(1L, 0), List.of(validOption(1L)), List.of(1L)),
                Arguments.of("negative quantity", Map.of(1L, -1), List.of(validOption(1L)), List.of(1L)),
                Arguments.of("malformed option id", Map.of(-1L, 1), List.of(), List.of(-1L)),
                Arguments.of("null option id", selectionWithNullId(), List.of(), Arrays.asList((Long) null)));
    }

    private static Map<Long, Integer> selectionWithNullId() {
        Map<Long, Integer> selection = new HashMap<>();
        selection.put(null, 1);
        return selection;
    }

    private static ShippingRequirementDto fclRequirement(Map<Long, Integer> selection) {
        ShippingRequirementDto requirement = new ShippingRequirementDto();
        requirement.setOrigin(1L);
        requirement.setDestination(2L);
        requirement.setShippingType(ShippingType.WATER);
        requirement.setSeaFreightMode(SeaFreightMode.FCL);
        requirement.setShippingDate(LocalDate.now().plusDays(1));
        requirement.setContainerCount(selection);
        return requirement;
    }

    private static ContainerType validOption(Long id) {
        ContainerType option = new ContainerType(id);
        option.setCode("20GP");
        option.setName("20 Standard");
        option.setIsActive(true);
        option.setInternalLengthMeters(new BigDecimal("5.895"));
        option.setInternalWidthMeters(new BigDecimal("2.350"));
        option.setInternalHeightMeters(new BigDecimal("2.392"));
        option.setCapacityCbm(new BigDecimal("33.00"));
        option.setTareWeightKg(new BigDecimal("2230.00"));
        option.setMaximumCargoWeightKg(new BigDecimal("28230.00"));
        option.setMaximumTotalWeightKg(new BigDecimal("30460.00"));
        return option;
    }

    private static FCLFreightRate fclRate(ContainerType option, String rate) {
        FCLFreightRate fclRate = new FCLFreightRate();
        fclRate.setContainerType(option);
        fclRate.setRate(new BigDecimal(rate));
        fclRate.setCurrency("USD");
        fclRate.setDocumentationFee(BigDecimal.ZERO);
        fclRate.setBunkerAdjustmentRate(BigDecimal.ZERO);
        fclRate.setTerminalHandlingCharge(BigDecimal.ZERO);
        return fclRate;
    }

    private static Specification<CourierRate> anyQuoteSpecification() {
        return ArgumentMatchers.any();
    }
}