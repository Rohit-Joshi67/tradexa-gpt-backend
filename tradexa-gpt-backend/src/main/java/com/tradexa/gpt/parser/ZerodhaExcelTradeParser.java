package com.tradexa.gpt.parser;

import com.tradexa.gpt.entity.Trade;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Component
public class ZerodhaExcelTradeParser implements TradeParser {

    @Override
    public List<Trade> parse(MultipartFile file) {
        List<Trade> trades = new ArrayList<>();
        try (InputStream is = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.iterator();

            int symbolCol = -1, qtyCol = -1, buyAvgCol = -1, sellAvgCol = -1, pnlCol = -1;
            boolean headersFound = false;

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                if (row == null) continue;

                if (!headersFound) {
                    for (Cell cell : row) {
                        if (cell.getCellType() != CellType.STRING) continue;
                        String val = cell.getStringCellValue().trim().toLowerCase();
                        if (val.contains("symbol") || val.equals("instrument")) symbolCol = cell.getColumnIndex();
                        else if (val.equals("quantity") || val.equals("qty")) qtyCol = cell.getColumnIndex();
                        else if (val.contains("buy") && val.contains("avg")) buyAvgCol = cell.getColumnIndex();
                        else if (val.contains("sell") && val.contains("avg")) sellAvgCol = cell.getColumnIndex();
                        else if (val.contains("realized") || val.equals("pnl") || val.equals("p&l")) pnlCol = cell.getColumnIndex();
                    }
                    if (symbolCol != -1 && pnlCol != -1) {
                        headersFound = true;
                    }
                    continue;
                }

                try {
                    Cell symbolCell = row.getCell(symbolCol);
                    if (symbolCell == null || symbolCell.getCellType() == CellType.BLANK) continue;
                    
                    String symbol = symbolCell.getStringCellValue();
                    if (symbol.isEmpty() || symbol.equalsIgnoreCase("total")) continue;

                    double qty = getNumeric(row.getCell(qtyCol));
                    double buyAvg = getNumeric(row.getCell(buyAvgCol));
                    double sellAvg = getNumeric(row.getCell(sellAvgCol));
                    double pnl = getNumeric(row.getCell(pnlCol));

                    Trade trade = new Trade();
                    trade.setSymbol(symbol);
                    trade.setBroker("Zerodha");
                    trade.setEntryPrice(BigDecimal.valueOf(buyAvg));
                    trade.setExitPrice(BigDecimal.valueOf(sellAvg));
                    trade.setQuantity((int) qty);
                    trade.setPnl(BigDecimal.valueOf(pnl));
                    trade.setEntryTime(LocalDateTime.now());

                    if (buyAvg > 0 || sellAvg > 0) {
                        trades.add(trade);
                    }
                } catch (Exception e) { }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return trades;
    }

    private double getNumeric(Cell cell) {
        if (cell == null) return 0.0;
        if (cell.getCellType() == CellType.NUMERIC) {
            return cell.getNumericCellValue();
        } else if (cell.getCellType() == CellType.STRING) {
            try {
                return Double.parseDouble(cell.getStringCellValue().replaceAll("[^\\d.-]", ""));
            } catch (Exception e) {
                return 0.0;
            }
        }
        return 0.0;
    }
}
