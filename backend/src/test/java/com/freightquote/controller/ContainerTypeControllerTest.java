package com.freightquote.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.freightquote.service.ContainerTypeService;

@ExtendWith(MockitoExtension.class)
class ContainerTypeControllerTest {

    @Mock
    private ContainerTypeService containerTypeService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(new ContainerTypeController(containerTypeService))
                .build();
    }

    @Test
    void doesNotExposeLegacyEntityLookupsOrCatalogueMutations() throws Exception {
        mockMvc.perform(get("/container-types/1")).andExpect(status().isNotFound());
        mockMvc.perform(get("/container-types/code/20GP")).andExpect(status().isNotFound());
        mockMvc.perform(get("/container-types/suitable")).andExpect(status().isNotFound());
        mockMvc.perform(post("/container-types/volume-weight")).andExpect(status().isNotFound());
        mockMvc.perform(post("/container-types/chargeable-weight")).andExpect(status().isNotFound());
        mockMvc.perform(post("/container-types").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isMethodNotAllowed());
        mockMvc.perform(put("/container-types/1").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isNotFound());
        mockMvc.perform(delete("/container-types/1")).andExpect(status().isNotFound());
    }
}