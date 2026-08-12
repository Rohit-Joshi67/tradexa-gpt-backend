package com.tradexa.gpt.service;

import com.tradexa.gpt.dto.UploadResponseDTO;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.tradexa.gpt.entity.Trade;
import com.tradexa.gpt.parser.CsvTradeParser;
import com.tradexa.gpt.exception.InvalidFileException;


import java.util.List;

@Service
public class FileService {
    private final CsvTradeParser csvTradeParser;
    private final TradeService tradeService;

    public FileService(CsvTradeParser csvTradeParser,TradeService tradeService)
    {
        this.csvTradeParser=csvTradeParser;
        this.tradeService=tradeService;
    }

    public UploadResponseDTO uploadFile(MultipartFile file) {

        if (file.isEmpty()) {
            throw new InvalidFileException("File is empty.");
        }

        String fileName = file.getOriginalFilename();

        if (fileName == null || !fileName.toLowerCase().endsWith(".csv")) {
            throw new InvalidFileException("Only CSV files are allowed.");
        }
        List<Trade> trades = csvTradeParser.parse(file);
        tradeService.saveAllTrades(trades);

        UploadResponseDTO response = new UploadResponseDTO();

        response.setFileName(file.getOriginalFilename());
        response.setFileType(file.getContentType());
        response.setFileSize(file.getSize());

        return response;
    }
}