package com.tradexa.gpt.parser;

import com.tradexa.gpt.entity.Trade;
import com.tradexa.gpt.entity.TradeSide;
import com.tradexa.gpt.exception.CsvParsingException;
import com.tradexa.gpt.util.ParserUtil;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Component
public class CsvTradeParser {

    public List<Trade> parse(MultipartFile file) {
        List<Trade> trades = new ArrayList<>();
        try{
            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(file.getInputStream())
            );

            CSVParser csvParser= CSVFormat.DEFAULT.builder().setHeader()
                    .setSkipHeaderRecord(true)
                    .build()
                    .parse(reader);

            for(CSVRecord record : csvParser) {
                Trade trade = new Trade();
                trade.setSymbol(
                        ParserUtil.parseString(record.get("Symbol"))
                );

                trade.setSide(
                        ParserUtil.parseTradeSide(record.get("Side"))
                );

                trade.setQuantity(
                        ParserUtil.parseInteger(record.get("Quantity"))
                );

                trade.setEntryPrice(
                        ParserUtil.parseBigDecimal(record.get("EntryPrice"))
                );

                trade.setExitPrice(
                        ParserUtil.parseBigDecimal(record.get("ExitPrice"))
                );

                trade.setEntryTime(
                        ParserUtil.parseDate(record.get("EntryTime"))
                );

                trade.setExitTime(
                        ParserUtil.parseDate(record.get("ExitTime"))
                );

                trade.setPnl(
                        ParserUtil.parseBigDecimal(record.get("Pnl"))
                );

                trades.add(trade);
            }

        } catch (Exception e) {
            throw new CsvParsingException("Failed to parse CSV file: " + e.getMessage());
        }

        return trades;
    }
}
