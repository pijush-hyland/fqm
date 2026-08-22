package com.freightquote.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.freightquote.exception.GlobalExceptionHandler;
import com.freightquote.exception.InvalidContainerSelectionException;
import com.freightquote.service.QuoteService;

class QuoteControllerTest {

    private QuoteService quoteService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        quoteService = mock(QuoteService.class);
        QuoteController controller = new QuoteController();
        ReflectionTestUtils.setField(controller, "quoteService", quoteService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void returnsStableInvalidContainerSelectionResponse() throws Exception {
        when(quoteService.findMatchingQuotes(any()))
                .thenThrow(new InvalidContainerSelectionException(List.of(2L, 999L)));

        mockMvc.perform(post("/quotes/get-quotes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "origin": 1,
                                  "destination": 2,
                                  "shippingType": "WATER",
                                  "seaFreightMode": "FCL",
                                  "shippingDate": "2026-09-01",
                                  "containerCount": {"2": 1, "999": 1}
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_CONTAINER_SELECTION"))
                .andExpect(jsonPath("$.containerIds[0]").value(2))
                .andExpect(jsonPath("$.containerIds[1]").value(999));
    }

    @Test
    void returnsStableInvalidContainerSelectionResponseForMalformedContainerId() throws Exception {
        mockMvc.perform(post("/quotes/get-quotes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "origin": 1,
                                  "destination": 2,
                                  "shippingType": "WATER",
                                  "seaFreightMode": "FCL",
                                  "shippingDate": "2026-09-01",
                                  "containerCount": {"not-an-id": 1}
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_CONTAINER_SELECTION"))
                .andExpect(jsonPath("$.containerIds[0]").value("not-an-id"));
    }

    @Test
    void reportsTheContainerIdWhenItsQuantityIsMalformed() throws Exception {
        mockMvc.perform(post("/quotes/get-quotes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "origin": 1,
                                  "destination": 2,
                                  "shippingType": "WATER",
                                  "seaFreightMode": "FCL",
                                  "shippingDate": "2026-09-01",
                                  "containerCount": {"1": "bad"}
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_CONTAINER_SELECTION"))
                .andExpect(jsonPath("$.containerIds[0]").value("1"));
    }
}