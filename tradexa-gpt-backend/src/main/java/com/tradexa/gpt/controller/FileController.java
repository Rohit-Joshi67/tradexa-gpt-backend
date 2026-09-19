package com.tradexa.gpt.controller;

import com.tradexa.gpt.common.ApiResponse;
import com.tradexa.gpt.billing.RequireJournalAccess;
import com.tradexa.gpt.dto.UploadResponseDTO;
import com.tradexa.gpt.service.FileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/files")
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @RequireJournalAccess
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<UploadResponseDTO>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "broker", defaultValue = "GENERIC") String broker
    ) {
        UploadResponseDTO responseDTO = fileService.uploadFile(file, broker);
        ApiResponse<UploadResponseDTO> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("File uploaded successfully");
        response.setData(responseDTO);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }
}

