package com.tradexa.gpt.parser;

import com.tradexa.gpt.entity.Trade;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface TradeParser {
    List<Trade> parse(MultipartFile file);
}

