package com.tradexa.gpt.service;

import com.tradexa.gpt.dto.TradeRequest;
import com.tradexa.gpt.dto.TradeResponse;
import com.tradexa.gpt.entity.Trade;
import com.tradexa.gpt.entity.TradeSide;
import com.tradexa.gpt.entity.User;
import com.tradexa.gpt.entity.UserRole;
import com.tradexa.gpt.exception.TradeNotFoundException;
import com.tradexa.gpt.repository.TradeRepository;
import com.tradexa.gpt.security.CurrentUserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class TradeServiceTest {

    @Mock
    private TradeRepository tradeRepository;

    @Mock
    private CurrentUserService currentUserService;

    @InjectMocks
    private TradeService tradeService;

    private User testUser;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        testUser = new User();
        testUser.setId(1L);
        testUser.setName("Rohit");
        testUser.setEmail("rohit@gmail.com");
        testUser.setRole(UserRole.USER);

        when(currentUserService.getCurrentUser()).thenReturn(testUser);
    }

    @Test
    void addTradeSuccess() {
        TradeRequest request = buildTradeRequest();

        Trade savedTrade = buildTrade(10);
        when(tradeRepository.save(any(Trade.class))).thenReturn(savedTrade);

        TradeResponse response = tradeService.addTrade(request);

        assertNotNull(response);
        assertEquals(10, response.getId());
        assertEquals("RELIANCE", response.getSymbol());
        verify(tradeRepository).save(any(Trade.class));
    }

    @Test
    void getAllTradesReturnsOnlyCurrentUserTrades() {
        Trade trade = buildTrade(1);
        when(tradeRepository.findAllByUserId(1L)).thenReturn(List.of(trade));

        List<TradeResponse> responses = tradeService.getAllTrades();

        assertEquals(1, responses.size());
        assertEquals("RELIANCE", responses.get(0).getSymbol());
        verify(tradeRepository).findAllByUserId(1L);
    }

    @Test
    void getTradeByIdNotFound() {
        when(tradeRepository.findByIdAndUserId(99, 1L)).thenReturn(Optional.empty());

        assertThrows(TradeNotFoundException.class, () -> tradeService.getTradeById(99));
    }

    private TradeRequest buildTradeRequest() {
        TradeRequest request = new TradeRequest();
        request.setSymbol("RELIANCE");
        request.setSide(TradeSide.BUY);
        request.setQuantity(10);
        request.setEntryPrice(BigDecimal.valueOf(100));
        request.setExitPrice(BigDecimal.valueOf(110));
        request.setEntryTime(LocalDateTime.of(2026, 1, 10, 9, 30));
        request.setExitTime(LocalDateTime.of(2026, 1, 10, 15, 15));
        request.setPnl(BigDecimal.valueOf(100));
        return request;
    }

    private Trade buildTrade(int id) {
        Trade trade = new Trade();
        trade.setId(id);
        trade.setSymbol("RELIANCE");
        trade.setSide(TradeSide.BUY);
        trade.setQuantity(10);
        trade.setEntryPrice(BigDecimal.valueOf(100));
        trade.setExitPrice(BigDecimal.valueOf(110));
        trade.setEntryTime(LocalDateTime.of(2026, 1, 10, 9, 30));
        trade.setExitTime(LocalDateTime.of(2026, 1, 10, 15, 15));
        trade.setPnl(BigDecimal.valueOf(100));
        trade.setUser(testUser);
        return trade;
    }
}
