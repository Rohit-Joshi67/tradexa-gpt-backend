package com.tradexa.gpt.service;

import com.tradexa.gpt.dto.UploadResponseDTO;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.tradexa.gpt.entity.Trade;
import com.tradexa.gpt.parser.TradeParserFactory;
import com.tradexa.gpt.parser.TradeParser;
import com.tradexa.gpt.exception.InvalidFileException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.CharsetDecoder;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
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

        sniffCsvContent(file);

        TradeParser parser = tradeParserFactory.getParser(broker);
        List<Trade> trades = parser.parse(file);
        tradeService.saveAllTrades(trades);

        UploadResponseDTO response = new UploadResponseDTO();
        response.setFileName(file.getOriginalFilename());
        response.setFileType(file.getContentType());
        response.setFileSize(file.getSize());

        return response;
    }

    /**
     * Sniffs the actual file content instead of trusting the extension and the
     * client-supplied content type. Rejects binaries (NUL bytes, ZIP/OOXML
     * magic numbers like a renamed .xlsx) and non-UTF-8 payloads.
     */
    private void sniffCsvContent(MultipartFile file) {
        byte[] head = new byte[8192];
        int read;
        try (InputStream in = file.getInputStream()) {
            read = in.read(head);
        } catch (IOException e) {
            throw new InvalidFileException("Could not read the uploaded file.");
        }
        if (read <= 0) {
            throw new InvalidFileException("File is empty.");
        }

        // ZIP magic (PK\x03\x04) — e.g. an .xlsx renamed to .csv.
        if (read >= 4 && head[0] == 0x50 && head[1] == 0x4B
                && head[2] == 0x03 && head[3] == 0x04) {
            throw new InvalidFileException("This looks like a spreadsheet (.xlsx), not a CSV. Please export it as CSV and try again.");
        }

        for (int i = 0; i < read; i++) {
            if (head[i] == 0x00) {
                throw new InvalidFileException("This doesn't look like a CSV file (binary content detected).");
            }
        }

        CharsetDecoder decoder = StandardCharsets.UTF_8.newDecoder()
                .onMalformedInput(CodingErrorAction.REPORT)
                .onUnmappableCharacter(CodingErrorAction.REPORT);
        try {
            decoder.decode(java.nio.ByteBuffer.wrap(head, 0, read));
        } catch (CharacterCodingException e) {
            throw new InvalidFileException("CSV must be UTF-8 encoded text.");
        }
    }
}



