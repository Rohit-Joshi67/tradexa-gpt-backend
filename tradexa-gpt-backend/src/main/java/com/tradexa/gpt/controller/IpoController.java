package com.tradexa.gpt.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.tradexa.gpt.common.ApiResponse;
import com.tradexa.gpt.ipo.IpoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ipo")
public class IpoController {

    private final IpoService ipoService;

    public IpoController(IpoService ipoService) {
        this.ipoService = ipoService;
    }

    @GetMapping("/evaluate")
    public ResponseEntity<ApiResponse<JsonNode>> evaluateIpo(
            @RequestParam String name,
            @RequestParam(defaultValue = "false") boolean forceRefresh
    ) {
        try {
            // Note: forceRefresh should ideally be restricted to Admin users
            // Here we just accept it via parameter, and it can be controlled via frontend or SecurityConfig
            JsonNode result = ipoService.evaluateIpo(name, forceRefresh);
            return ResponseEntity.ok(new ApiResponse<>(true, "Success", result, java.time.LocalDateTime.now()));
        } catch (Exception e) {
            // Log the exception in a real application
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<>(false, "Failed to evaluate IPO: " + e.getMessage(), null, java.time.LocalDateTime.now()));
        }
    }
}

