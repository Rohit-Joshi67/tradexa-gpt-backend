package com.tradexa.gpt.service;

import com.tradexa.gpt.dto.TradeRequest;
import com.tradexa.gpt.dto.TradeResponse;
import com.tradexa.gpt.entity.Trade;
import com.tradexa.gpt.entity.User;
import com.tradexa.gpt.exception.TradeNotFoundException;
import com.tradexa.gpt.mapper.TradeMapper;
import com.tradexa.gpt.repository.TradeRepository;
import com.tradexa.gpt.security.CurrentUserService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TradeService {

    private final TradeRepository tradeRepository;
    private final CurrentUserService currentUserService;

    public TradeService(TradeRepository tradeRepository,
                        CurrentUserService currentUserService) {
        this.tradeRepository = tradeRepository;
        this.currentUserService = currentUserService;
    }

    public TradeResponse addTrade(TradeRequest request) {
        User currentUser = currentUserService.getCurrentUser();
        Trade trade = TradeMapper.toEntity(request);
        trade.setUser(currentUser);
        Trade savedTrade = tradeRepository.save(trade);
        return TradeMapper.toResponse(savedTrade);
    }

    public List<TradeResponse> getAllTrades() {
        User currentUser = currentUserService.getCurrentUser();
        return tradeRepository.findAllByUserId(currentUser.getId())
                .stream()
                .map(TradeMapper::toResponse)
                .toList();
    }

    public TradeResponse getTradeById(Integer id) {
        User currentUser = currentUserService.getCurrentUser();
        Trade trade = tradeRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new TradeNotFoundException(id));
        return TradeMapper.toResponse(trade);
    }

    public void deleteTrade(Integer id) {
        User currentUser = currentUserService.getCurrentUser();
        if (!tradeRepository.existsByIdAndUserId(id, currentUser.getId())) {
            throw new TradeNotFoundException(id);
        }
        tradeRepository.deleteById(id);
    }

    public TradeResponse updateTrade(Integer id, TradeRequest request) {
        User currentUser = currentUserService.getCurrentUser();
        Trade trade = tradeRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new TradeNotFoundException(id));

        trade.setSymbol(request.getSymbol());
        trade.setSide(request.getSide());
        trade.setQuantity(request.getQuantity());
        trade.setEntryPrice(request.getEntryPrice());
        trade.setExitPrice(request.getExitPrice());
        trade.setEntryTime(request.getEntryTime());
        trade.setExitTime(request.getExitTime());
        trade.setPnl(request.getPnl());

        Trade updatedTrade = tradeRepository.save(trade);
        return TradeMapper.toResponse(updatedTrade);
    }

    public void saveAllTrades(List<Trade> trades) {
        User currentUser = currentUserService.getCurrentUser();
        trades.forEach(trade -> trade.setUser(currentUser));
        tradeRepository.saveAll(trades);
    }

    public List<Trade> getTradesForCurrentUser() {
        User currentUser = currentUserService.getCurrentUser();
        return tradeRepository.findAllByUserId(currentUser.getId());
    }
}
