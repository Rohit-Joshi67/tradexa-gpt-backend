package com.tradexa.gpt.service;

import com.tradexa.gpt.dto.UploadResponseDTO;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.tradexa.gpt.entity.Trade;
import com.tradexa.gpt.parser.TradeParserFactory;
import com.tradexa.gpt.parser.TradeParser;
import com.tradexa.gpt.exception.InvalidFileException;

import java.util.List;

@Service
public class FileService {
    private final TradeParserFactory tradeParserFactory;
    private final TradeService tradeService;

    public FileService(TradeParserFactory tradeParserFactory, TradeService tradeService) {
        this.tradeParserFactory = tradeParserFactory;
        this.tradeService = tradeService;
    }

    public UploadResponseDTO uploadFile(MultipartFile file, String broker) {

        if (file.isEmpty()) {
            throw new InvalidFileException("File is empty.");
        }

        String fileName = file.getOriginalFilename();

        if (fileName == null || !fileName.toLowerCase().endsWith(".csv")) {
            throw new InvalidFileException("Only CSV files are allowed.");
        }
        
        TradeParser parser = tradeParserFactory.getParser(broker);
        List<Trade> trades = parser.parse(file);
        tradeService.saveAllTrades(trades);

        UploadResponseDTO response = new UploadResponseDTO();
        response.setFileName(file.getOriginalFilename());
        response.setFileType(file.getContentType());
        response.setFileSize(file.getSize());

        return response;
    }
}



