package com.tradexa.gpt.parser;

import com.tradexa.gpt.entity.Trade;
import com.tradexa.gpt.entity.TradeSide;
import com.tradexa.gpt.exception.CsvParsingException;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Component
public class DhanCsvTradeParser implements TradeParser {

    private static class RawTrade {
        String symbol;
        TradeSide side;
        int quantity;
        BigDecimal price;
        LocalDateTime time;
    }

    @Override
    public List<Trade> parse(MultipartFile file) {
        List<RawTrade> rawTrades = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        try {
            BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()));
            CSVParser csvParser = CSVFormat.DEFAULT.builder().setHeader()
                    .setSkipHeaderRecord(true)
                    .build()
                    .parse(reader);

            for (CSVRecord record : csvParser) {
                if (!"Traded".equalsIgnoreCase(record.get("Status"))) {
                    continue;
                }

                RawTrade rt = new RawTrade();
                rt.symbol = record.get("Name");
                String sideStr = record.get("Buy/Sell");
                rt.side = "BUY".equalsIgnoreCase(sideStr) ? TradeSide.BUY : TradeSide.SELL;
                rt.quantity = Integer.parseInt(record.get("Quantity/Lot").trim());
                rt.price = new BigDecimal(record.get("Trade Price").trim());
                
                String dateStr = record.get("Date").trim();
                String timeStr = record.get("Time").trim();
                rt.time = LocalDateTime.parse(dateStr + " " + timeStr, formatter);
                
                rawTrades.add(rt);
            }
        } catch (Exception e) {
            throw new CsvParsingException("Failed to parse Dhan CSV file: " + e.getMessage());
        }

        rawTrades.sort(Comparator.comparing(rt -> rt.time));

        Map<String, List<RawTrade>> tradesBySymbol = new HashMap<>();
        for (RawTrade rt : rawTrades) {
            tradesBySymbol.computeIfAbsent(rt.symbol, k -> new ArrayList<>()).add(rt);
        }

        List<Trade> closedTrades = new ArrayList<>();

        for (Map.Entry<String, List<RawTrade>> entry : tradesBySymbol.entrySet()) {
            String symbol = entry.getKey();
            List<RawTrade> symTrades = entry.getValue();

            Queue<RawTrade> buyQ = new LinkedList<>();
            Queue<RawTrade> sellQ = new LinkedList<>();

            for (RawTrade rt : symTrades) {
                if (rt.side == TradeSide.BUY) {
                    processTrade(symbol, rt, sellQ, buyQ, closedTrades);
                } else {
                    processTrade(symbol, rt, buyQ, sellQ, closedTrades);
                }
            }
        }

        return closedTrades;
    }

    private void processTrade(String symbol, RawTrade rt, Queue<RawTrade> oppQ, Queue<RawTrade> sameQ, List<Trade> closedTrades) {
        int remainingQty = rt.quantity;

        while (remainingQty > 0 && !oppQ.isEmpty()) {
            RawTrade oppTrade = oppQ.peek();
            int matchQty = Math.min(remainingQty, oppTrade.quantity);

            Trade closedTrade = new Trade();
            closedTrade.setSymbol(symbol);
            closedTrade.setQuantity(matchQty);
            closedTrade.setBroker("DHAN");
            
            boolean isLongTrade = oppTrade.side == TradeSide.BUY;
            closedTrade.setSide(isLongTrade ? TradeSide.BUY : TradeSide.SELL);

            RawTrade entryTrade = oppTrade;
            RawTrade exitTrade = rt;

            closedTrade.setEntryTime(entryTrade.time);
            closedTrade.setExitTime(exitTrade.time);
            closedTrade.setEntryPrice(entryTrade.price);
            closedTrade.setExitPrice(exitTrade.price);

            BigDecimal qty = new BigDecimal(matchQty);
            BigDecimal pnl;
            if (isLongTrade) {
                pnl = exitTrade.price.subtract(entryTrade.price).multiply(qty);
            } else {
                pnl = entryTrade.price.subtract(exitTrade.price).multiply(qty);
            }
            closedTrade.setPnl(pnl.setScale(2, RoundingMode.HALF_UP));

            closedTrades.add(closedTrade);

            remainingQty -= matchQty;
            oppTrade.quantity -= matchQty;

            if (oppTrade.quantity == 0) {
                oppQ.poll();
            }
        }

        if (remainingQty > 0) {
            RawTrade rem = new RawTrade();
            rem.symbol = rt.symbol;
            rem.side = rt.side;
            rem.price = rt.price;
            rem.time = rt.time;
            rem.quantity = remainingQty;
            sameQ.offer(rem);
        }
    }
}

