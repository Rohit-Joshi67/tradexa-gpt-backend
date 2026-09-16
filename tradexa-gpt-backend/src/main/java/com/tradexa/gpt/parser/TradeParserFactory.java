package com.tradexa.gpt.parser;

import org.springframework.stereotype.Component;

@Component
public class TradeParserFactory {
    private final GenericCsvTradeParser genericCsvTradeParser;
    private final DhanCsvTradeParser dhanCsvTradeParser;

    public TradeParserFactory(GenericCsvTradeParser genericCsvTradeParser, DhanCsvTradeParser dhanCsvTradeParser) {
        this.genericCsvTradeParser = genericCsvTradeParser;
        this.dhanCsvTradeParser = dhanCsvTradeParser;
    }

    public TradeParser getParser(String broker) {
        if ("DHAN".equalsIgnoreCase(broker)) {
            return dhanCsvTradeParser;
        }
        return genericCsvTradeParser;
    }
}

